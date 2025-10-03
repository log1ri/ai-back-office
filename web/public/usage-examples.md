# Usage Examples

## cURL

```
curl -X POST https://ocr.internal/api/v1/ocr/plate \
  -H "Authorization: Bearer $OCR_API_KEY" \
  -F image=@sample_plate.jpg
```

## Python (requests)

```python
import requests

API = "https://ocr.internal/api/v1/ocr/plate"
KEY = "YOUR_KEY"

files = {"image": open("sample_plate.jpg", "rb")}
headers = {"Authorization": f"Bearer {KEY}"}
resp = requests.post(API, files=files, headers=headers)
print(resp.json())
```

## JavaScript (fetch + base64)

```js
async function ocrPlate(base64) {
  const resp = await fetch('https://ocr.internal/api/v1/ocr/plate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.OCR_API_KEY,
    },
    body: JSON.stringify({ image_base64: base64, options: { enhance: true } })
  });
  return resp.json();
}
```

## Handling Low Confidence

```python
result = resp.json()
for plate in result.get('plates', []):
    if plate['confidence'] < 0.9:
        # trigger manual review
        print('FLAG REVIEW', plate['formatted'], plate['confidence'])
```

## Submitting Feedback

```python
import requests

feedback = {
  "plate_id": "c9b3ecf2-...",
  "correct_text": "กข1234",
  "reason": "3 misread as 8 due to glare"
}
requests.post("https://ocr.internal/api/v1/ocr/feedback", json=feedback, headers=headers)
```

## Batch Processing Script (Python)

```python
import glob, json, time, requests

API = "https://ocr.internal/api/v1/ocr/plate"
KEY = "YOUR_KEY"
headers = {"Authorization": f"Bearer {KEY}"}

for path in glob.glob('dataset/frames/*.jpg'):
    with open(path,'rb') as f:
        r = requests.post(API, files={'image': f}, headers=headers, timeout=10)
    data = r.json()
    print(path, data.get('plates'))
    time.sleep(0.05)  # throttle
```

## Debug Mode Output

Enable debug=true to receive detection boxes + intermediate crops (base64) for QA.

---

Continue to best practices.