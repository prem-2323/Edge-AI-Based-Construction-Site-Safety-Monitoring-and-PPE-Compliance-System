"""YOLOv8 PPE inference pipeline for uploaded construction-site videos."""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import timedelta
from functools import lru_cache
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from ultralytics import YOLO


FRAME_BUCKET_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
TEMPORAL_WINDOW = 5
UNSAFE_THRESHOLD = 3

LABEL_ALIASES = {
    "person": "person",
    "worker": "person",
    "helmet": "helmet",
    "hard_hat": "helmet",
    "vest": "vest",
    "safety_vest": "vest",
    "shoes": "shoes",
    "boots": "shoes",
    "safety_shoes": "shoes",
    "gloves": "gloves",
    "safety_gloves": "gloves",
}

PPE_ORDER = ["helmet", "vest", "shoes", "gloves"]
PPE_TITLES = {
    "helmet": "Helmet Missing",
    "vest": "Vest Missing",
    "shoes": "Shoes Missing",
    "gloves": "Gloves Missing",
}


@dataclass
class ViolationItem:
    time: str
    worker_id: int
    missing_ppe: list[str]
    severity: str
    status: str


def build_empty_response() -> dict[str, Any]:
    return {
        "workers": 0,
        "safe": 0,
        "unsafe": 0,
        "alerts": 0,
        "violations": [],
        "analytics": {
            "helmet_missing_count": 0,
            "vest_missing_count": 0,
            "shoes_missing_count": 0,
            "gloves_missing_count": 0,
            "violation_rate": 0.0,
            "weekly_trend": [{"day": day, "violations": 0} for day in FRAME_BUCKET_LABELS],
            "pie_distribution": [{"name": PPE_TITLES[ppe], "count": 0} for ppe in PPE_ORDER],
            "total_workers": 0,
            "safe_count": 0,
            "unsafe_count": 0,
            "alerts_count": 0,
        },
        "annotated_video": "",
    }


def clear_model_cache() -> None:
    load_model.cache_clear()


@lru_cache(maxsize=1)
def load_model(model_path: str) -> YOLO:
    path = Path(model_path)
    if not path.exists():
        raise FileNotFoundError(f"Model not found: {path}")
    return YOLO(str(path))


def _normalize_label(label: str) -> str:
    return LABEL_ALIASES.get(label.lower().replace(" ", "_"), label.lower().replace(" ", "_"))


def _iou(box_a: list[float], box_b: list[float]) -> float:
    x1 = max(box_a[0], box_b[0])
    y1 = max(box_a[1], box_b[1])
    x2 = min(box_a[2], box_b[2])
    y2 = min(box_a[3], box_b[3])
    inter = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    area_a = max(0.0, box_a[2] - box_a[0]) * max(0.0, box_a[3] - box_a[1])
    area_b = max(0.0, box_b[2] - box_b[0]) * max(0.0, box_b[3] - box_b[1])
    denom = area_a + area_b - inter
    return inter / denom if denom > 0 else 0.0


def _box_center(box: list[float]) -> tuple[float, float]:
    return ((box[0] + box[2]) / 2.0, (box[1] + box[3]) / 2.0)


def _region(box: list[float], *, top: float, bottom: float, left: float = 0.0, right: float = 1.0) -> list[float]:
    x1, y1, x2, y2 = box
    width = x2 - x1
    height = y2 - y1
    return [
        x1 + width * left,
        y1 + height * top,
        x1 + width * right,
        y1 + height * bottom,
    ]


def _contains(region: list[float], box: list[float]) -> bool:
    cx, cy = _box_center(box)
    return region[0] <= cx <= region[2] and region[1] <= cy <= region[3]


def _person_regions(person_box: list[float]) -> dict[str, list[float]]:
    return {
        "head": _region(person_box, top=0.0, bottom=0.25, left=0.15, right=0.85),
        "torso": _region(person_box, top=0.25, bottom=0.72, left=0.1, right=0.9),
        "feet": _region(person_box, top=0.72, bottom=1.0, left=0.05, right=0.95),
        "hands_left": _region(person_box, top=0.28, bottom=0.62, left=0.0, right=0.35),
        "hands_right": _region(person_box, top=0.28, bottom=0.62, left=0.65, right=1.0),
    }


def _assess_presence(person_box: list[float], class_boxes: dict[str, list[list[float]]]) -> dict[str, bool]:
    regions = _person_regions(person_box)
    helmet = any(_contains(regions["head"], box) or _iou(regions["head"], box) > 0.1 for box in class_boxes["helmet"])
    vest = any(_contains(regions["torso"], box) or _iou(regions["torso"], box) > 0.1 for box in class_boxes["vest"])
    shoes = any(_contains(regions["feet"], box) or _iou(regions["feet"], box) > 0.08 for box in class_boxes["shoes"])
    gloves = any(
        _contains(regions["hands_left"], box)
        or _contains(regions["hands_right"], box)
        or _iou(regions["hands_left"], box) > 0.05
        or _iou(regions["hands_right"], box) > 0.05
        for box in class_boxes["gloves"]
    )
    return {"helmet": helmet, "vest": vest, "shoes": shoes, "gloves": gloves}


def _severity_from_missing(missing: list[str]) -> str:
    if not missing:
        return "low"
    if "helmet" in missing or "shoes" in missing:
        return "high"
    return "medium"


def _format_time(seconds: float) -> str:
    return str(timedelta(seconds=max(0, int(seconds))))


def _draw_label(frame: np.ndarray, box: list[int], text: str, color: tuple[int, int, int]) -> None:
    x1, y1, x2, y2 = box
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    text_y = y1 - 10 if y1 > 20 else y1 + 18
    cv2.putText(frame, text, (x1, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2, cv2.LINE_AA)


def run_ppe_inference(video_path: Path, model_path: Path, outputs_dir: Path) -> dict[str, Any]:
    model = load_model(str(model_path))

    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        raise ValueError(f"Unable to open video: {video_path}")

    fps = capture.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 1280)
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 720)
    total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    outputs_dir.mkdir(parents=True, exist_ok=True)
    output_path = outputs_dir / f"{video_path.stem}_annotated.mp4"
    writer = cv2.VideoWriter(str(output_path), cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))

    worker_history: dict[int, list[str]] = defaultdict(list)
    worker_status: dict[int, str] = {}
    worker_missing_signatures: dict[int, tuple[str, ...]] = {}
    violation_events: list[ViolationItem] = []
    missing_counter: Counter[str] = Counter()
    frame_bucket_counter = [0 for _ in FRAME_BUCKET_LABELS]
    total_unique_workers: set[int] = set()
    frame_index = 0

    try:
        results = model.track(
            source=str(video_path),
            stream=True,
            persist=True,
            tracker="bytetrack.yaml",
            verbose=False,
        )

        for result in results:
            frame_index += 1
            frame = result.orig_img.copy() if result.orig_img is not None else np.zeros((height, width, 3), dtype=np.uint8)
            boxes = result.boxes
            if boxes is None or len(boxes) == 0:
                writer.write(frame)
                continue

            class_boxes: dict[str, list[list[float]]] = {key: [] for key in PPE_ORDER}
            person_entries: list[tuple[int, list[float]]] = []

            cls_ids = boxes.cls.cpu().numpy().astype(int)
            xyxy = boxes.xyxy.cpu().numpy().tolist()
            track_ids = boxes.id.cpu().numpy().astype(int).tolist() if boxes.id is not None else None
            names = result.names or {}

            for index, class_id in enumerate(cls_ids):
                name = _normalize_label(names.get(int(class_id), str(class_id)))
                box = xyxy[index]
                if name == "person":
                    track_id = track_ids[index] if track_ids is not None else (frame_index * 1000 + index)
                    person_entries.append((track_id, box))
                    total_unique_workers.add(track_id)
                elif name in class_boxes:
                    class_boxes[name].append(box)

            colors = {
                "helmet": (0, 215, 255),
                "vest": (255, 191, 0),
                "shoes": (255, 128, 0),
                "gloves": (180, 120, 255),
            }
            for ppe_name, ppe_boxes in class_boxes.items():
                for box in ppe_boxes:
                    x1, y1, x2, y2 = map(int, box)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), colors[ppe_name], 2)
                    cv2.putText(
                        frame,
                        ppe_name.upper(),
                        (x1, max(14, y1 - 6)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.45,
                        colors[ppe_name],
                        1,
                        cv2.LINE_AA,
                    )

            for track_id, person_box in person_entries:
                presence = _assess_presence(person_box, class_boxes)
                missing = [label for label in PPE_ORDER if not presence[label]]
                status = "SAFE" if not missing else "UNSAFE"

                worker_history[track_id].append(status)
                if len(worker_history[track_id]) > TEMPORAL_WINDOW:
                    worker_history[track_id].pop(0)

                unsafe_votes = sum(1 for value in worker_history[track_id] if value == "UNSAFE")
                confirmed = unsafe_votes >= UNSAFE_THRESHOLD and bool(missing)

                worker_status[track_id] = "UNSAFE" if confirmed else ("SAFE" if not missing else worker_status.get(track_id, status))

                signature = tuple(missing)
                if confirmed and worker_missing_signatures.get(track_id) != signature:
                    timestamp = _format_time(frame_index / fps)
                    severity = _severity_from_missing(missing)
                    violation_events.append(
                        ViolationItem(
                            time=timestamp,
                            worker_id=track_id,
                            missing_ppe=missing,
                            severity=severity,
                            status="UNSAFE",
                        )
                    )
                    worker_missing_signatures[track_id] = signature
                    missing_counter.update(missing)

                    bucket_index = min(
                        len(frame_bucket_counter) - 1,
                        int((frame_index / max(1, total_frames or frame_index)) * len(frame_bucket_counter)),
                    )
                    frame_bucket_counter[bucket_index] += 1

                color = (0, 200, 0) if not missing else (0, 0, 255)
                x1, y1, x2, y2 = map(int, person_box)
                label = f"ID {track_id} {status}"
                if missing:
                    label += f" | Missing: {', '.join(missing)}"
                _draw_label(frame, [x1, y1, x2, y2], label, color)

            cv2.putText(
                frame,
                f"Workers: {len(total_unique_workers)} | Alerts: {len(violation_events)}",
                (20, 35),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )
            writer.write(frame)

    finally:
        capture.release()
        writer.release()

    safe_workers = sum(1 for state in worker_status.values() if state == "SAFE")
    unsafe_workers = sum(1 for state in worker_status.values() if state == "UNSAFE")
    alert_count = len(violation_events)

    analytics = {
        "total_workers": len(total_unique_workers),
        "safe_count": safe_workers,
        "unsafe_count": unsafe_workers,
        "alerts_count": alert_count,
        "helmet_missing_count": missing_counter["helmet"],
        "vest_missing_count": missing_counter["vest"],
        "shoes_missing_count": missing_counter["shoes"],
        "gloves_missing_count": missing_counter["gloves"],
        "violation_rate": round((unsafe_workers / len(total_unique_workers)) if total_unique_workers else 0.0, 4),
        "weekly_trend": [
            {"day": label, "violations": frame_bucket_counter[index]}
            for index, label in enumerate(FRAME_BUCKET_LABELS)
        ],
        "pie_distribution": [
            {"name": PPE_TITLES[ppe], "count": missing_counter[ppe]}
            for ppe in PPE_ORDER
        ],
        "frames_processed": frame_index,
        "video_fps": fps,
    }

    return {
        "workers": len(total_unique_workers),
        "safe": safe_workers,
        "unsafe": unsafe_workers,
        "alerts": alert_count,
        "violations": [asdict(item) for item in violation_events],
        "analytics": analytics,
        "annotated_video": f"/outputs/{output_path.name}",
    }