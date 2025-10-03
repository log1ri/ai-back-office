# Changelog

Versioning scheme: MAJOR.MINOR.PATCH

Legend:
- Added: new feature
- Changed: behavior modification (backward compatible)
- Fixed: bug fix
- Data: dataset / labeling changes
- Perf: speed / memory improvement
- Ops: deployment / infra
- Deprecated: feature planned for removal

## 3.1.0 (Current)
Date: 2025-08-13

Highlights: Baseline documentation import.

Changes:
- Added: Public API docs, examples, best practices
- Added: Active learning feedback endpoint
- Added: Confidence threshold recommendations
- Perf: Avg GPU latency 55ms @ 640px input (A10)

Metrics:
- Detection mAP@0.5: 0.962
- Sequence Accuracy: 0.938
- Character Accuracy: 0.989

## 3.0.2
Date: 2025-07-22

- Fixed: Province spacing normalization edge case
- Perf: Post-process regex optimization (-6ms avg)

## 3.0.1
Date: 2025-07-10

- Fixed: CRNN dropout seed inconsistency
- Ops: Rollout canary script

## 3.0.0
Date: 2025-07-01

- Changed: Upgrade detector to YOLOv8 (from YOLOv5)
- Added: Expanded charset (Thai vowel variants)
- Added: Per-character confidence output
- Data: +18k annotated night images
- Perf: -18% latency vs 2.x

Metrics delta vs 2.6.4:
- +2.1% sequence accuracy
- +0.5% detection mAP
- -18% avg latency

## 2.6.4
Date: 2025-06-12

- Fixed: Misread similar glyph heuristic (ภ vs ฤ)
- Added: Low-confidence logging

## 2.6.0
Date: 2025-05-28

- Data: Added 5k rain / glare images
- Perf: Quantized recognizer (INT8) optional build

## 2.5.0
Date: 2025-04-30

- Added: Feedback ingestion pipeline (internal only)

## 2.0.0
Date: 2025-02-10

- Changed: Switched recognizer to CRNN (from CNN-only)
- Added: BiLSTM layers for sequence modeling

## 1.x (Pre-2025)

Initial prototype releases (internal only), limited documentation.

---

Future Planned:
- 3.2.0: Transformer recognizer experiment
- 4.0.0: Unified end-to-end detector-recognizer model