# نشر EAM على Oracle Cloud Always Free (Jeddah)

دليل خطوة بخطوة لرفع `eam.sa` على Oracle — **$0/شهر**.

## المتطلبات

- حساب Oracle Cloud ([oracle.com/cloud/free](https://www.oracle.com/cloud/free/))
- دومين `eam.sa` (DNS)
- مستودع GitHub: `eam-infomuajebholding-dev/eam-platform`
- (اختياري) بطاقة للتحقق — لا يُخصم ضمن Always Free

---

## 1) إنشاء حساب Oracle

1. سجّل على [Oracle Cloud Free](https://www.oracle.com/cloud/free/).
2. **Home Region:** اختر **Saudi Arabia (Jeddah)** — `me-jeddah-1`.
3. إن لم يظهر Jeddah، جرّب **UAE (Abu Dhabi)**.
4. أكمل التحقق (قد يُطلب بطاقة).

---

## 2) إنشاء السيرفر (VM)

**Menu → Compute → Instances → Create instance**

| الإعداد | القيمة |
|---------|--------|
| Name | `eam-prod` |
| Image | Ubuntu 22.04 |
| Shape | **Ampere** → `VM.Standard.A1.Flex` |
| OCPU | **2** |
| Memory | **12 GB** |
| Boot volume | 50 GB (ضمن المجاني) |
| SSH keys | أضف مفتاحك العام (موصى به) |

**Create.**

### فتح المنافذ (مهم — بدونها الموقع لا يعمل)

**Networking → Virtual cloud networks → Security List → Ingress Rules**

أضف:

| Source | Port | Protocol |
|--------|------|----------|
| `0.0.0.0/0` | 22 | TCP |
| `0.0.0.0/0` | 80 | TCP |
| `0.0.0.0/0` | 443 | TCP |

> إن ظهر **"Out of host capacity"** — غيّر Availability Domain أو أعد المحاولة لاحقاً.

---

## 3) اتصل بالسيرفر

```bash
ssh ubuntu@YOUR_PUBLIC_IP
```

---

## 4) تجهيز السيرفر

```bash
curl -fsSL https://raw.githubusercontent.com/eam-infomuajebholding-dev/eam-platform/main/deploy/scripts/oracle-server-setup.sh | sudo bash
```

أو يدوياً:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# أعد تسجيل الدخول SSH
sudo apt-get install -y git ufw
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 5) استنساخ المشروع

```bash
git clone https://github.com/eam-infomuajebholding-dev/eam-platform.git
cd eam-platform
```

---

## 6) إعداد المتغيرات

```bash
cp app/.env.example app/.env
cp deploy/.env.oracle.example deploy/.env
```

عدّل **`app/.env`**:

```env
JWT_SECRET_KEY=استخدم-سلسلة-عشوائية-طويلة
FRONTEND_URL=https://eam.sa

# OIDC — يمكن الإبقاء على auth.atoms.dev مؤقتاً
OIDC_ISSUER_URL=
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=

# Stripe (عند التفعيل)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

عدّل **`deploy/.env`**:

```env
POSTGRES_PASSWORD=كلمة-سر-قوية-للقاعدة
FRONTEND_URL=https://eam.sa
```

> `DATABASE_URL` يُضبط تلقائياً في `docker-compose.yml` على PostgreSQL داخل Docker.

---

## 7) البناء والتشغيل

```bash
cd deploy
docker compose --env-file .env up -d --build
```

انتظر حتى تكتمل الحاويات (~5–10 دقائق أول مرة).

### ترحيل قاعدة البيانات

```bash
docker compose exec backend alembic upgrade head
```

### التحقق

```bash
curl -s http://localhost/api/config
curl -s http://localhost/health || curl -s http://localhost:8000/health
docker compose ps
```

---

## 8) ربط eam.sa

### أ) DNS

في مزود الدومين:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `YOUR_PUBLIC_IP` |
| A | `www` | `YOUR_PUBLIC_IP` |

### ب) SSL — الطريقة الأسهل (Cloudflare)

1. أضف `eam.sa` إلى Cloudflare.
2. غيّر nameservers عند الم registrar.
3. SSL/TLS → **Flexible** أو **Full** (إن أضفت certbot لاحقاً).
4. Proxy (سحابة برتقالية) **ON**.

الزوار: HTTPS → Cloudflare → HTTP port 80 على Oracle.

### ج) SSL — Let's Encrypt (بدون Cloudflare)

على السيرفر (يتطلب تعديل nginx لـ 443 — أو استخدم Caddy بدلاً من nginx).

---

## 9) OIDC و Stripe (بعد النشر)

1. **OIDC redirect URI:** `https://eam.sa/auth/callback`
2. **Stripe webhook:** `https://eam.sa/api/v1/payments/webhook` (أو المسار الفعلي في backend)

---

## 10) التحديث بعد تغييرات GitHub

```bash
cd ~/eam-platform
git pull
cd deploy
docker compose --env-file .env up -d --build
docker compose exec backend alembic upgrade head
```

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| الموقع لا يفتح من الخارج | تحقق من Oracle Security List (80, 443) + `ufw status` |
| `Out of host capacity` | جرّب AD آخر أو region UAE |
| Backend 502 | `docker compose logs backend` |
| DB connection error | `docker compose logs db` — تحقق من `deploy/.env` |
| OIDC redirect mismatch | حدّث redirect URI عند مزود OIDC |

---

## البقاء ضمن Always Free

- استخدم **Ampere A1** فقط (2 OCPU / 12 GB كافية).
- لا تنشئ Load Balancer مدفوعاً.
- عطّل OpenAI/Copilot مؤقتاً لتجنب تكلفة API.
- راقب **Billing → Cost Analysis** — يجب أن يبقى $0.

---

## البنية

```
Internet → eam.sa (DNS)
         → Oracle VM :80
              ├── nginx (frontend dist)
              └── /api → FastAPI :8000
                        └── PostgreSQL (Docker volume)
```
