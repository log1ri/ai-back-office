# Best Practices

## Image Capture

- Prefer frontal plate images
- Min width of plate region: 180px for high accuracy
- Avoid excessive compression (JPEG quality >= 70)
- Use shutter speed > 1/250s for motion
- Night: enable IR or proper exposure (avoid overexposed retroreflective glare)

## Preprocessing

- Denoise + sharpen helps blurred night images
- Avoid aggressive contrast that distorts Thai glyph shapes
- Crop to plate before upscaling

## Throughput & Scaling

- Batch requests (base64) if latency budget allows
- Use GPU for >5 QPS sustained
- Apply rate limiting per API key
- Cache results by image hash for duplicate frames

## Error Handling

- Log 422 cases with image metadata for later model improvement
- Surface per-character confidence to UI for partial acceptance
- Implement retry (exponential) only for 500 errors, not 4xx

## Security

- Rotate API keys every 90 days
- Enforce HTTPS + WAF rules
- Size + type validation before decoding image

## Monitoring KPIs

| KPI | Target |
| --- | ------ |
| Sequence Accuracy (prod sample) | >93% |
| 95th Latency (GPU) | &lt;180ms |
| Error Rate (5xx) | &lt;0.2% |
| Low-Confidence Rate (&lt;0.9) | &lt;12% |

## Data Privacy

- Anonymize full vehicle images after cropping plate if required
- Purge raw uploads older than 30 days unless flagged for training

## Updating Models

- Never skip regression suite
- Stagger rollout: 10% -> 50% -> 100%
- Monitor deltas for 24h at each stage

## Fallback Strategy

- If detector fails: attempt adaptive threshold + contour fallback (optional)
- If recognizer uncertain: return top-N hypotheses (future feature)

## Roadmap Ideas

- Transformer-based recognizer
- Distillation for edge deployment
- On-device pre-filter for bandwidth saving

---

End of OCR documentation set.