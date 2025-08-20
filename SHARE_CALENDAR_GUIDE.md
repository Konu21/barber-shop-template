# Calendar Sharing Guide

Această ghidă explică cum să partajezi calendarul Google pentru a permite clienților să vădă disponibilitatea.

## 🔗 Partajare Publică

### 1. Setări Calendar

1. Deschide [Google Calendar](https://calendar.google.com/)
2. Găsește calendarul frizeriei în lista din stânga
3. Click dreapta pe numele calendarului
4. Selectează "Settings and sharing"

### 2. Configurare Partajare

În secțiunea "Access permissions for events":

1. **Bifează** "Make available to public"
2. **Selectează** "See only free/busy (hide details)" pentru securitate
3. **Copiază** link-ul de partajare public

### 3. Integrare în Website

Adaugă link-ul în website pentru ca clienții să poată vedea disponibilitatea:

```html
<a href="YOUR_CALENDAR_PUBLIC_LINK" target="_blank">
  Vezi disponibilitatea în calendar
</a>
```

## 🔐 Partajare Privată

### Pentru Staff/Colaboratori:

1. În setările calendarului, mergi la "Share with specific people"
2. Adaugă email-urile membrilor echipei
3. Setează permisiunile:
   - **Make changes to events**: Pentru manageri
   - **See all event details**: Pentru staff
   - **See only free/busy**: Pentru colaboratori

### Pentru Integrare API:

1. Creează un Service Account în Google Cloud Console
2. Adaugă email-ul Service Account în partajarea calendarului
3. Setează permisiunile la "Make changes to events"

## 📱 Embed în Website

### Opțiunea 1: Iframe Embed

1. În setările calendarului, mergi la "Integrate calendar"
2. Copiază codul iframe
3. Adaugă-l în website:

```html
<iframe
  src="YOUR_CALENDAR_EMBED_URL"
  style="border: 0"
  width="800"
  height="600"
  frameborder="0"
  scrolling="no"
>
</iframe>
```

### Opțiunea 2: Link Direct

```html
<a
  href="https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID"
  target="_blank"
  class="btn btn-primary"
>
  📅 Vezi Calendarul
</a>
```

## 🔧 Configurare Avansată

### Sincronizare Automată

Pentru sincronizare automată cu aplicația:

1. **Service Account**: Folosește credențialele din `google-credentials.json`
2. **Calendar ID**: Configurează în variabilele de mediu
3. **Permisiuni**: Service Account trebuie să aibă acces de editare

### Setări Recomandate

```env
# În .env.local
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

## 📊 Tipuri de Calendar

### Calendar Public (Recomandat)

- **Avantaje**: Clienții pot vedea disponibilitatea
- **Dezavantaje**: Informațiile sunt publice
- **Securitate**: Folosește "See only free/busy"

### Calendar Privat

- **Avantaje**: Control total asupra informațiilor
- **Dezavantaje**: Clienții nu pot vedea disponibilitatea
- **Securitate**: Maximă

### Calendar Hibrid

- **Avantaje**: Balanță între accesibilitate și securitate
- **Implementare**: Calendar public pentru disponibilitate + sistem de programare separat

## ⚠️ Considerații de Securitate

### Informații Sensibile

- **Nu afișa** numele clienților în calendarul public
- **Nu afișa** numerele de telefon
- **Nu afișa** email-urile clienților

### Configurare Recomandată

- **Titlu eveniment**: "Programare" sau "Rezervat"
- **Descriere**: Fără informații personale
- **Participanți**: Doar staff-ul

## 🚀 Pentru Producție

### Checklist Deployment:

- [ ] Calendar configurat cu permisiuni corecte
- [ ] Service Account configurat
- [ ] Variabile de mediu setate
- [ ] Testat sincronizarea
- [ ] Verificat securitatea
- [ ] Testat pe dispozitive mobile

### Monitorizare:

- Verifică log-urile pentru erori de sincronizare
- Monitorizează accesul la calendar
- Verifică periodic funcționalitatea

## 📞 Suport

Pentru probleme cu partajarea:

1. Verifică permisiunile calendarului
2. Verifică că Service Account are acces
3. Testează link-urile de partajare
4. Verifică setările de securitate Google
