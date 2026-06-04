"""Train and evaluate a YOLOv8 PPE detector locally.

This script replaces the Colab notebook flow with a repeatable local entrypoint.
It trains a model on the dataset in backend/construction-ppe, validates it, runs a
sample prediction, and optionally saves a comparison chart for key metrics.

Example:
    python backend/train_ppe_model.py --epochs 50 --batch 16 --device 0
"""

from __future__ import annotations

import argparse
import importlib
import shutil
from pathlib import Path
from typing import Iterable

import cv2
import yaml

try:
    plt = importlib.import_module("matplotlib.pyplot")
    pd = importlib.import_module("pandas")
    sns = importlib.import_module("seaborn")
except ModuleNotFoundError:  # pragma: no cover - optional plotting deps
    plt = None
    pd = None
    sns = None

from ultralytics import YOLO


ROOT = Path(__file__).resolve().parent
DATA_YAML = ROOT / "construction-ppe" / "data.yaml"
DEFAULT_OUTPUT_DIR = ROOT / "output"
DEFAULT_MODEL_DIR = ROOT / "models"
DEFAULT_BEST_MODEL = DEFAULT_MODEL_DIR / "best.pt"


def _resolve_path(base: Path, value: str | None) -> Path | None:
    if not value:
        return None
    path = Path(value)
    return path if path.is_absolute() else (base / path).resolve()


def _load_dataset_info(data_yaml: Path) -> dict:
    with data_yaml.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def _find_sample_image(dataset_root: Path, relative_val_dir: str) -> Path | None:
    val_dir = (dataset_root / relative_val_dir).resolve()
    if not val_dir.exists():
        return None
    for extension in ("*.jpg", "*.jpeg", "*.png", "*.bmp", "*.webp"):
        candidates = sorted(val_dir.glob(extension))
        if candidates:
            return candidates[0]
    return None


def _safe_classification(detected: Iterable[str]) -> tuple[str, list[str]]:
    normalized = {item.lower().strip() for item in detected}
    required = ["helmet", "vest"]
    missing = [item for item in required if item not in normalized]
    if "person" not in normalized and "worker" not in normalized:
        return "No worker detected", []
    if not missing:
        return "SAFE: worker wearing helmet and vest", []
    return "UNSAFE", missing


def _plot_metrics(map50: float, map5095: float, inference_ms: float, output_path: Path) -> None:
    if plt is None or pd is None or sns is None:
        print("Skipping metrics chart because matplotlib/pandas/seaborn are not installed.")
        return

    metrics_df = pd.DataFrame(
        {
            "Metric": ["mAP50", "mAP50-95", "Inference Speed (ms)"],
            "Value": [map50, map5095, inference_ms],
        }
    )

    plt.figure(figsize=(10, 6))
    sns.barplot(x="Metric", y="Value", data=metrics_df, palette="viridis")
    plt.title("Comparison of Model Metrics")
    plt.ylabel("Value")
    plt.grid(axis="y", linestyle="--", alpha=0.7)
    plt.tight_layout()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_path, dpi=200)
    plt.close()


def train_model(
    data_yaml: Path,
    epochs: int,
    imgsz: int,
    batch: int,
    workers: int,
    device: str,
    model_name: str,
    project_dir: Path,
) -> Path:
    model = YOLO(model_name)
    results = model.train(
        data=str(data_yaml),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        workers=workers,
        device=device,
        project=str(project_dir),
        name="train",
        exist_ok=True,
    )

    best_model = Path(results.save_dir) / "weights" / "best.pt"
    if not best_model.exists():
        raise FileNotFoundError(f"Training completed but no best.pt was produced at {best_model}")
    return best_model


def validate_and_export(best_model: Path, data_yaml: Path, imgsz: int, output_dir: Path) -> None:
    model = YOLO(str(best_model))
    metrics = model.val(data=str(data_yaml), imgsz=imgsz)

    map50 = float(getattr(metrics.box, "map50", 0.0) or 0.0)
    map5095 = float(getattr(metrics.box, "map", 0.0) or 0.0)

    dataset_info = _load_dataset_info(data_yaml)
    dataset_root = _resolve_path(data_yaml.parent, dataset_info.get("path")) or data_yaml.parent
    sample_image = _find_sample_image(dataset_root, dataset_info.get("val", "images/val"))

    inference_ms = 0.0
    if sample_image is not None:
        prediction = model(str(sample_image))
        detected = []
        for result in prediction:
            for box in result.boxes:
                detected.append(result.names[int(box.cls)].lower())

        summary, missing = _safe_classification(detected)
        print(f"Sample image: {sample_image}")
        print(f"Detected classes: {sorted(set(detected))}")
        print(summary)
        if missing:
            print(f"Missing PPE: {missing}")

        annotated = prediction[0].plot()
        annotated_path = output_dir / "sample_prediction.jpg"
        output_dir.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(annotated_path), annotated)
        print(f"Annotated sample saved to: {annotated_path}")

        speed = getattr(prediction[0], "speed", {}) or {}
        inference_ms = float(speed.get("inference", 0.0) or 0.0)
        print(f"Inference speed: {inference_ms:.2f} ms/image")
    else:
        print("No validation sample image found, skipping sample inference.")

    chart_path = output_dir / "metrics_comparison.png"
    _plot_metrics(map50, map5095, inference_ms, chart_path)
    if chart_path.exists():
        print(f"Metrics chart saved to: {chart_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train a YOLOv8 PPE detector locally.")
    parser.add_argument("--data", type=Path, default=DATA_YAML, help="Path to the dataset YAML file.")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs.")
    parser.add_argument("--imgsz", type=int, default=640, help="Training and validation image size.")
    parser.add_argument("--batch", type=int, default=16, help="Batch size.")
    parser.add_argument("--workers", type=int, default=2, help="Data loader workers.")
    parser.add_argument("--device", type=str, default="0", help="Device identifier passed to Ultralytics.")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Base model to start from.")
    parser.add_argument("--project-dir", type=Path, default=ROOT / "runs" / "detect", help="Directory for training runs.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR, help="Directory for exported artifacts.")
    parser.add_argument("--copy-best", action="store_true", help="Copy the trained best.pt into backend/models/best.pt.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data_yaml = args.data.resolve()
    if not data_yaml.exists():
        raise FileNotFoundError(f"Dataset YAML not found: {data_yaml}")

    args.project_dir.mkdir(parents=True, exist_ok=True)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    DEFAULT_MODEL_DIR.mkdir(parents=True, exist_ok=True)

    best_model = train_model(
        data_yaml=data_yaml,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        workers=args.workers,
        device=args.device,
        model_name=args.model,
        project_dir=args.project_dir,
    )

    print(f"Best model produced at: {best_model}")

    if args.copy_best:
        shutil.copy2(best_model, DEFAULT_BEST_MODEL)
        print(f"Copied trained model to: {DEFAULT_BEST_MODEL}")

    validate_and_export(best_model, data_yaml, args.imgsz, args.output_dir)


if __name__ == "__main__":
    main()