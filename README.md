# 🧠 BrainTech

**1-9-cu sinif şagirdləri üçün onlayn təhsil platforması**

BrainTech — şagirdlər, müəllimlər və valideynlər üçün nəzərdə tutulmuş müasir onlayn imtahan və bilik yarışları platformasıdır.

## ✨ Xüsusiyyətlər

- 🎓 Şagird Paneli — onlayn imtahanlar, nəticələr, statistika
- 👨‍🏫 Müəllim Paneli — imtahan yaratma, sual əlavə etmə, nəticələrin izlənməsi
- 📊 Statistika — fərdi və sinif üzrə analitika
- 🏆 Bilik yarışları — rəqabətli öyrənmə
- 🎯 3 sual tipi — çoxseçimli, doğru/yanlış, boşluq doldur
- ⏱ Vaxt sayğacı — real imtahan təcrübəsi
- 🔐 Rol əsaslı giriş — şagird, müəllim, valideyn, admin

## 🛠 Texnologiya Yığını

- Frontend: Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- Backend / Baza: Supabase (PostgreSQL, Auth, Storage)
- Autentifikasiya: Supabase Auth
- Dil: TypeScript
- Dev mühiti: Turbopack + Supabase CLI (Docker)

## 🚀 Quraşdırma

Tələblər: Node.js 20+, Docker, npm

git clone https://github.com/USERNAME/braintech.git
cd braintech
npm install
npx supabase start
npm run dev

Brauzerdə aç: http://localhost:3000

## 📁 Layihə Strukturu

braintech/
- app/
  - (auth)/login, register
  - dashboard/exams/[id]/edit, results, take
  - dashboard/exams/new
- components/landing/FAQ.tsx
- lib/auth, exams, supabase
- public/images
- supabase/
- proxy.ts

## 🗄 Baza Sxemi

Əsas cədvəllər: profiles, subjects, topics, questions, exams, exam_questions, attempts, answers, classes

## 🎯 Yol Xəritəsi

- [x] Auth (login, register, logout)
- [x] Rol idarəsi
- [x] İmtahan yaratma və yayımlama
- [x] Sual əlavə etmə
- [x] İmtahan vermə
- [x] Avtomatik qiymətləndirmə
- [x] Müəllim nəticələr səhifəsi
- [x] Landing page
- [ ] Şagird statistikası (qrafiklər)
- [ ] Valideyn paneli
- [ ] Sertifikatlar
- [ ] Deploy (Vercel + Supabase Cloud)

## 📄 Lisenziya

MIT License

## 👥 Müəllif

BrainTech — 2026
