# إعداد مرة واحدة — ثم النشر تلقائي

بعد **5 دقائق** من إعدادك، كل `git push` إلى `main` ينشر تلقائياً (أو شغّل workflow يدوياً).

## ما الذي **يجب** أن تفعله أنت (مرة واحدة)

Oracle لا يسمح لأي طرف ثالث (بما في ذلك Cursor) بإنشاء حساب نيابةً عنك.

### 1) Oracle VM (10 دقائق)

1. [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) — Home Region: **Jeddah**
2. Create instance: Ubuntu 22.04, Ampere **2 OCPU / 12 GB**
3. أضف **SSH public key** (من جهازك: `cat ~/.ssh/id_ed25519.pub`)
4. Security List: افتح **22, 80, 443**
5. انسخ **Public IP**

### 2) GitHub Secrets (دقيقتان)

Repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | القيمة |
|--------|--------|
| `ORACLE_HOST` | IP السيرفر |
| `ORACLE_SSH_KEY` | محتوى المفتاح **الخاص** (`id_ed25519`) |
| `ORACLE_SSH_USER` | `ubuntu` (اختياري) |

### 3) ملف `.env` على السيرفر (أول مرة)

اتصل SSH مرة واحدة:

```bash
ssh ubuntu@YOUR_IP
git clone https://github.com/eam-infomuajebholding-dev/eam-platform.git
cd eam-platform
nano app/.env    # JWT, OIDC, Stripe, FRONTEND_URL=https://eam.sa
nano deploy/.env # POSTGRES_PASSWORD
```

### 4) DNS

`eam.sa` → A record → IP السيرفر

---

## بعد ذلك — **أنا / CI ينشر**

- Push إلى `main` → GitHub Action `Deploy to Oracle`
- أو: Actions → Deploy to Oracle → Run workflow

```bash
# أو يدوياً على السيرفر:
bash deploy/deploy-eam.sh
```
