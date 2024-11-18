**Logify Funkcionális Specifikáció**

---

### 1. Bevezetés

A Logify egy munkavállalói munkaidő-nyilvántartó és projektmenedzsment platform, amely segíti a csapatokat a munkaórák, feladatok és projektek nyomon követésében, valamint a termelékenység mérésében. A rendszer két fő felhasználói szerepkört biztosít: adminisztrátor és alkalmazott. Az adminisztrátorok teljes körű hozzáféréssel rendelkeznek, míg az alkalmazottak csak saját munkájukat kezelhetik.

Ez a dokumentum részletesen bemutatja a rendszer funkcionális követelményeit és leírásait, amelyeket a fejlesztőknek figyelembe kell venniük a rendszer megvalósításakor.

---

### 2. Rendszer Áttekintése

A Logify platform alapvető funkciói:

- **Projektmenedzsment**: Feladatok létrehozása, hozzárendelése és nyomon követése.
- **Munkaidő-nyilvántartás**: Munkaidő rögzítése heti nyomtatványokkal.
- **Csapatszintű együttműködés**: Feladatok és projektek közötti együttműködés, kommunikáció.
- **Analitika**: Grafikonok és mérőszámok a projektek és munkaórák elemzéséhez.
- **Felhasználói szerepkörök**: Adminisztrátorok és alkalmazottak kezelése különböző jogosultságokkal.

---

### 3. Funkcionális Leírások

#### 3.1. Felhasználói Regisztráció és Bejelentkezés

##### 3.1.1. Regisztráció

- **Szerepkör:** Minden új felhasználó (Admin, Alkalmazott) számára regisztráció szükséges.
- **Lépések:**
  1. A felhasználó regisztrál a rendszerben egy email cím és jelszó megadásával.
  2. A rendszer ellenőrzi az email címet és a jelszót.
  3. Az adminisztrátor jóváhagyhatja a felhasználót (Alkalmazott esetén), vagy automatikusan jóváhagyásra kerül.
- **Elvárt eredmény:** A felhasználó sikeresen létrehozott egy fiókot és bejelentkezhet a rendszerbe.

##### 3.1.2. Bejelentkezés

- **Szerepkör:** Admin és Alkalmazott.
- **Lépések:**
  1. A felhasználó megadja a regisztrált email címet és jelszót.
  2. A rendszer validálja a bejelentkezési adatokat.
  3. Ha helyesek, a felhasználó beléphet, különböző jogosultságokkal, amelyek a szerepkörének megfelelően változnak.
- **Elvárt eredmény:** Sikeres bejelentkezés, felhasználó az adott szerepkörnek megfelelő felületre kerül.

#### 3.2. Munkaidő Nyilvántartás

##### 3.2.1. Munkaidő Rögzítése

- **Szerepkör:** Alkalmazott.
- **Lépések:**
  1. Az alkalmazott bejelentkezik a rendszerbe.
  2. Az alkalmazott a "Munkaidő" menüpontra kattintva rögzíti a napi munkavégzési időt.
  3. A rendszer automatikusan a heti munkaidő-nyomtatványba menti a bejegyzést.
  4. Az alkalmazott a munkaóra bejegyzést elmentheti és módosíthatja.
- **Elvárt eredmény:** A rögzített munkaóra helyesen tárolódik a rendszerben és a heti összesítésben is megjelenik.

##### 3.2.2. Munkaidő Jóváhagyása

- **Szerepkör:** Adminisztrátor.
- **Lépések:**
  1. Az adminisztrátor belép a rendszerbe.
  2. Az adminisztrátor a "Munkaidő-nyilvántartás" menüben megtekinti az alkalmazottak által rögzített munkaórákat.
  3. Az adminisztrátor ellenőrzi a munkaórák helyességét.
  4. Az adminisztrátor jóváhagyhatja vagy módosíthatja a bejegyzéseket.
- **Elvárt eredmény:** A munkaórák sikeresen jóváhagyásra kerülnek, és az alkalmazottak a státuszát láthatják.

#### 3.3. Projektmenedzsment

##### 3.3.1. Projekt Létrehozása

- **Szerepkör:** Adminisztrátor.
- **Lépések:**
  1. Az adminisztrátor a "Projekt kezelése" menüben új projektet hoz létre.
  2. Az adminisztrátor megadja a projekt nevét, leírását, kezdő és befejező dátumát.
  3. Az adminisztrátor a projekthez feladatokat rendelhet.
- **Elvárt eredmény:** A projekt sikeresen létrejön, és a projekt listában megjelenik.

##### 3.3.2. Feladat Hozzárendelése

- **Szerepkör:** Adminisztrátor.
- **Lépések:**
  1. Az adminisztrátor kiválaszt egy projektet.
  2. A projekt részleteinél létrehozhat feladatokat, hozzárendelheti őket munkavállalókhoz.
  3. A feladatot tartalmazza a leírás, határidő és felelős személy.
- **Elvárt eredmény:** A feladat sikeresen létrejön és hozzárendelésre kerül a megfelelő alkalmazotthoz.

##### 3.3.3. Feladat Állapotának Frissítése

- **Szerepkör:** Adminisztrátor, Alkalmazott.
- **Lépések:**
  1. Az alkalmazott vagy adminisztrátor frissítheti egy adott feladat státuszát ("Folyamatban", "Befejezett", "Késlekedés").
  2. Az alkalmazott kommentet is hozzáadhat a feladathoz, ha szükséges.
- **Elvárt eredmény:** A feladat státusza frissül a rendszerben, és a projekt előrehaladása tükröződik.

#### 3.4. Analitikai Műszerfal

##### 3.4.1. Grafikonok és Mérőszámok

- **Szerepkör:** Adminisztrátor.
- **Lépések:**
  1. Az adminisztrátor a "Műszerfal" menüpontban elérheti a projektekhez és munkaidő-nyilvántartáshoz kapcsolódó grafikonokat.
  2. A rendszer különböző mérőszámokat jelenít meg, mint például: teljesített munkaórák, befejezett feladatok, projekt előrehaladás.
- **Elvárt eredmény:** Az adminisztrátor vizualizált adatokat lát a projektek és munkaórák állapotáról, amelyek segítenek a döntéshozatalban.

#### 3.5. Értesítések

##### 3.5.1. Valós Idejű Értesítések

- **Szerepkör:** Adminisztrátor, Alkalmazott.
- **Lépések:**
  1. A rendszer értesíti az alkalmazottakat és adminisztrátorokat a fontos eseményekről (pl. új feladat, határidő közeledik, munkaóra módosítás).
  2. Az értesítések a felhasználók által megadott email címekre vagy a rendszer felületén jelennek meg.
- **Elvárt eredmény:** A felhasználók időben értesülnek a fontos eseményekről.

---

### 4. Rendszerarchitektúra és Technikai Részletek

A rendszer backendje a **Neon PostgreSQL** adatbázisra épül. A frontend **Next.js** alapú, és a **TailwindCSS** biztosítja a stílusokat. Az alkalmazottak és adminisztrátorok hitelesítését a **NextAuth.js** biztosítja.

A frontend és a backend közötti kommunikáció **REST API** alapú lesz, és JSON formátumú adatokat küld.

---

### 5. Tesztelési Elvárások

- **Funkcionális tesztelés:** Ellenőrizni kell, hogy minden funkció a megfelelő mód

on működik (pl. munkaidő rögzítése, feladatok hozzáadása, státusz frissítése).
- **Biztonsági tesztelés:** A felhasználói adatok titkosítva legyenek, és a jelszavak tárolása biztonságos módon történjen.
- **Teljesítmény tesztelés:** A rendszer legyen képes nagy mennyiségű adat kezelésére és magas felhasználószámot is támogasson.

---

### 6. Követelmények

- A rendszer biztonságos, felhasználóbarát, és reszponzív legyen.
- A rendszer képes legyen valós idejű adatkezelésre, beleértve az értesítéseket és a grafikus megjelenítést.
