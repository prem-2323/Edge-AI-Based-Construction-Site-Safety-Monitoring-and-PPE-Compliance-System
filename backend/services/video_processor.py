"""Video processing: YOLOv8 track, PPE association, SAFE/UNSAFE, temporal voting, alerts."""
import sys
from pathlib import Path

# Ensure backend root is on path when running via uvicorn from project root
_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from datetime import datetime
from collections import defaultdict
import cv2
import threading

from config import (
    REQUIRED_PPE,
    PPE_CLASS_ALIASES,
    TEMPORAL_WINDOW,
    UNSAFE_THRESHOLD,
    OUTPUT_DIR,
    UPLOAD_DIR,
)
from services.alert_engine import push as alert_push
from services.analytics import update as analytics_update


def _norm_ppe(name: str) -> str:
    n = (name or "").lower().replace(" ", "_")
    return PPE_CLASS_ALIASES.get(n, n)


def _resolve_required() -> set:
    return {_norm_ppe(x) for x in REQUIRED_PPE}


def _iou(box1, box2):
    """Compute IoU between two boxes [x1,y1,x2,y2]."""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    a1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    a2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    return inter / (a1 + a2 - inter) if (a1 + a2 - inter) > 0 else 0


def _center_in(box_outer, box_inner):
    cx = (box_inner[0] + box_inner[2]) / 2
    cy = (box_inner[1] + box_inner[3]) / 2
    return box_outer[0] <= cx <= box_outer[2] and box_outer[1] <= cy <= box_outer[3]


def run_pipeline(model, video_path: str, output_path: str | None = None) -> None:
    """
    Process video: track persons + PPE, temporal voting, update alerts and analytics.
    If model is None, run in demo mode (synthetic alerts).
    """
    from services.alert_engine import get_all

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")

    required = _resolve_required()
    # track_id -> list of "SAFE"|"UNSAFE" for last TEMPORAL_WINDOW frames
    history: dict[int, list[str]] = defaultdict(list)
    # track_id -> last missing list (to avoid duplicate alerts)
    last_missing: dict[int, list] = {}
    total_workers_set = set()
    safe_now = 0
    unsafe_now = 0

    out_writer = None
    if output_path:
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out_writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))

    try:
        if model is not None:
            # Use YOLO track on video file with ByteTrack
            results_gen = model.track(
                source=video_path,
                stream=True,
                tracker="bytetrack.yaml",
                persist=True,
                verbose=False,
            )
            frame_idx = 0
            for result in results_gen:
                frame_idx += 1
                orig = result.orig_img
                boxes = result.boxes
                if boxes is None:
                    analytics_update(len(total_workers_set), safe_now, unsafe_now, len(get_all()))
                    if out_writer is not None and orig is not None:
                        out_writer.write(orig)
                    continue

                xyxy = boxes.xyxy.cpu().numpy()
                cls = boxes.cls.cpu().numpy().astype(int)
                ids = boxes.id.cpu().numpy() if boxes.id is not None else None
                names = result.names or {}

                # Assume first class or 'person' is person; rest are PPE candidates
                person_inds = [i for i, c in enumerate(cls) if (names.get(c, "").lower() in ("person", "worker", "0")) or c == 0]
                ppe_inds = [i for i in range(len(cls)) if i not in person_inds]

                track_status = {}  # id -> "SAFE"|"UNSAFE"
                track_missing = {}  # id -> [str]

                for i in person_inds:
                    tid = int(ids[i]) if ids is not None and i < len(ids) else (frame_idx * 1000 + i)
                    pbox = xyxy[i].tolist()
                    total_workers_set.add(tid)

                    found = set()
                    for j in ppe_inds:
                        ppe_class = names.get(int(cls[j]), "")
                        norm = _norm_ppe(ppe_class)
                        ppebox = xyxy[j].tolist()
                        if _center_in(pbox, ppebox) or _iou(pbox, ppebox) > 0.1:
                            for r in required:
                                if r in norm or norm in r:
                                    found.add(r)
                                    break

                    missing = [r for r in required if r not in found]
                    status = "UNSAFE" if missing else "SAFE"
                    track_status[tid] = status
                    track_missing[tid] = missing

                    # temporal
                    history[tid].append(status)
                    if len(history[tid]) > TEMPORAL_WINDOW:
                        history[tid].pop(0)
                    votes = sum(1 for s in history[tid] if s == "UNSAFE")
                    if votes >= UNSAFE_THRESHOLD and missing:
                        # only alert when we just confirmed (avoid spam)
                        prev_m = last_missing.get(tid, [])
                        if prev_m != missing:
                            alert_push(tid, "UNSAFE", missing)
                        last_missing[tid] = missing

                safe_now = sum(1 for s in track_status.values() if s == "SAFE")
                unsafe_now = sum(1 for s in track_status.values() if s == "UNSAFE")
                analytics_update(len(total_workers_set), safe_now, unsafe_now, len(get_all()))

                if out_writer is not None and orig is not None:
                    annotated = result.plot()
                    if annotated is not None:
                        out_writer.write(annotated)
                    else:
                        out_writer.write(orig)

        else:
            # Demo: simulate a few frames and add synthetic alerts
            n = 0
            while True:
                ok, frame = cap.read()
                if not ok or n >= 100:
                    break
                n += 1

                total_workers_set.update({1, 2})
                if n == 30:
                    alert_push(1, "UNSAFE", ["helmet"])
                if n == 50:
                    alert_push(2, "UNSAFE", ["vest"])

                safe_count = 1 if n < 30 else 0
                unsafe_count = 2 if n >= 50 else (1 if n >= 30 else 0)
                analytics_update(len(total_workers_set), safe_count, unsafe_count, len(get_all()))

                if out_writer is not None:
                    overlay = frame.copy()
                    status_text = "DEMO AI MODE"
                    frame_text = f"Frame {n:03d} | Safe: {safe_count} | Unsafe: {unsafe_count}"
                    cv2.putText(overlay, status_text, (24, 44), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 255), 2, cv2.LINE_AA)
                    cv2.putText(overlay, frame_text, (24, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2, cv2.LINE_AA)
                    cv2.putText(overlay, "Helmet missing" if n >= 30 else "Monitoring PPE compliance", (24, 118), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255) if n >= 30 else (0, 255, 0), 2, cv2.LINE_AA)
                    out_writer.write(overlay)
    finally:
        cap.release()
        if out_writer is not None:
            out_writer.release()
        if model is not None:
            analytics_update(len(total_workers_set), safe_now, unsafe_now, len(get_all()))
