# Hermes Multi-Provider Proxy

加權優先級代理，為 Hermes 子 agent 提供多 API 負載均衡。

## 優先順序（權重）
1. OpenRouter (5) → nemotron-3-super-120b-a12b:free
2. Cerebras (4) → gpt-oss-120b
3. NVIDIA (3) → nemotron-3-super-120b-a12b
4. GLM (2) → glm-4-flash
5. Gemini (1) → gemini-2.5-flash

## 部署
```bash
cp .env.example .env  # 填入各 API key
python3 fallback_proxy.py  # 預設 port 8731
```

## Hermes 設定
```yaml
delegation:
  provider: custom:fallback
  model: auto
```
