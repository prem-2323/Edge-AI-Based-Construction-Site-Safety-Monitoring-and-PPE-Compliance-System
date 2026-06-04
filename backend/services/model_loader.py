"""Load YOLOv8 model once at startup."""
from pathlib import Path

from config import MODEL_PATH, REQUIRE_MODEL

_model = None


def load_model():
    """Load YOLOv8 model from best.pt. Returns None if file missing and REQUIRE_MODEL is False."""
    global _model
    if _model is not None:
        return _model
    if not MODEL_PATH.exists():
        if REQUIRE_MODEL:
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}. Place best.pt in backend/models/")
        return None
    try:
        from ultralytics import YOLO
        _model = YOLO(str(MODEL_PATH))
        return _model
    except Exception as e:
        if REQUIRE_MODEL:
            raise
        return None


def get_model():
    global _model
    if _model is None:
        return load_model()
    return _model


def reset_model():
    global _model
    _model = None
    return load_model()
