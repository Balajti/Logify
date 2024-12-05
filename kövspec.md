**Logify Projekt Követelményspecifikáció**

---

### 1. Jelenlegi helyzet

A Logify egy olyan munkavállalói munkaidő-nyilvántartó és projektmenedzsment platform, amelyet csapatok számára terveztünk. A vállalkozások jelenleg munkaidő-nyilvántartásra és projektek kezelésére jellemzően manuális vagy szigetelt megoldásokat használnak. A nyilvántartás sokszor papíralapú vagy különböző táblázatokban zajlik, ami időigényes és hajlamos a hibákra. A Logify célja ezen folyamatok automatizálása, a munkaórák és projektek hatékonyabb nyomon követése, valamint a csapatszintű együttműködés javítása.

---

### 2. Vágyálom rendszer

A Logify platform célja, hogy könnyen kezelhető, felhasználóbarát online eszközként támogassa a munkaidő-nyilvántartást és a projektmenedzsmentet. A felhasználóknak lehetőséget biztosítunk arra, hogy valós időben kövessék a projekteket, kezeljék a feladatokat, és mérjék a termelékenységet. Az adminisztrátorok teljes hozzáféréssel rendelkeznek a rendszer minden funkciójához, míg az alkalmazottak csak saját munkájukat láthatják és kezelhetik. A rendszer célja, hogy minimalizálja az adminisztratív terheket és javítsa a csapatok közötti együttműködést.

Elvárt, hogy a rendszer reszponzív és platformfüggetlen legyen. Az alkalmazás webes alapú, tehát bármilyen eszközön elérhető kell legyen, beleértve a mobiltelefonokat és tableteket is. A rendszernek az alábbi technológiai stack-en kell működnie: TypeScript, Redux, TailwindCSS, NextAuth.js, PostgreSQL.

---

### 3. Jelenlegi üzleti folyamatok

**3.1. Projektmenedzsment**  
A vállalkozások jelenleg projektjeiket manuálisan kezelik, különböző táblázatokban vagy egyszerű feladatkezelő alkalmazásokban. A feladatok létrehozása, hozzárendelése és státuszfrissítése nem egységes, ami rontja a hatékonyságot.

**3.2. Munkaidő-nyilvántartás**  
A munkaidőt jelenleg papíralapú nyomtatványok segítségével rögzítik, amelyeket manuálisan kell összegyűjteni, ellenőrizni és feldolgozni.

**3.3. Csapatszintű együttműködés**  
A csapattagok közötti együttműködés jellemzően emailes kommunikációval és értekezletekkel történik, ami nem mindig hatékony és átlátható.

---

### 4. Igényelt üzleti folyamatok

**4.1. Munkaidő-nyilvántartás**  
- **Új munkaóra rögzítése:** Az alkalmazottak a rendszerbe belépve rögzíthetik napi munkaóráikat, amelyeket heti szinten nyomon lehet követni.
- **Munkaórák jóváhagyása:** Az adminisztrátorok jóváhagyhatják vagy módosíthatják a munkaórákat.
- **Automatikus értesítések:** A rendszer valós idejű értesítéseket küld a munkavállalóknak és az adminisztrátoroknak a munkaórák státuszáról.

**4.2. Projektmenedzsment**  
- **Feladatok létrehozása:** Az adminisztrátorok képesek új projekteket és feladatokat létrehozni, hozzárendelni azokat a megfelelő munkavállalókhoz.
- **Feladatok nyomon követése:** A rendszer nyújt eszközt a feladatok státuszának frissítésére és a projekt előrehaladásának követésére.
- **Csapatszintű együttműködés:** A csapatok számára feladatokkal kapcsolatos kommentek és információk cseréjére van lehetőség.

**4.3. Elemzés és riportálás**  
- **Analitikai műszerfal:** A rendszer biztosítja a grafikonokat és mérőszámokat a projektek, feladatok és munkaidő-nyilvántartások elemzésére.

**4.4. Felhasználói szerepkörök**  
- **Adminisztrátorok:** Teljes hozzáférésük van a rendszer minden funkciójához, beleértve a projektek és feladatok kezelését, a munkaidő-nyilvántartást, valamint a felhasználói fiókok kezelését.
- **Alkalmazottak:** Korlátozott hozzáféréssel rendelkeznek, csak saját munkaóráikat és feladataikat láthatják és kezelhetik.

---

### 5. A rendszerre vonatkozó szabályok

A rendszer webes alapú alkalmazás, amely a következő technológiai szabványoknak kell megfelelnie:
- **Frontend:** HTML5, CSS3, JavaScript (TypeScript), TailwindCSS, Recharts
- **Backend:** PostgreSQL adatbázis, Vercel hostolás
- **Biztonság:** Az alkalmazásnak biztosítania kell az alapvető biztonsági előírásokat, beleértve a jelszóvédelmet, az adatvédelmet (GDPR), és az SSL titkosítást.
- **Platformfüggetlenség:** A rendszer reszponzív dizájnnal kell rendelkezzen, hogy mobil eszközökön is jól működjön.

---

### 6. Követelménylista

- **K01** Könnyen üzemeltethető és karbantartható rendszer
- **K02** Reszponzív dizájn mobil és desktop platformokon egyaránt
- **K03** Két szerepkör kezelése: adminisztrátor, alkalmazott
- **K04** Valós idejű értesítések a projektek és munkaidő státuszának változásairól
- **K05** Részletes analitikai műszerfal projektek és feladatok nyomon követéséhez

---

### 7. Fogalomszótár

**Adminisztrátor:** A rendszer teljes hozzáféréssel rendelkező felhasználója, aki minden funkciót kezelhet.  
**Alkalmazott:** A rendszerbe belépő felhasználó, aki csak saját munkáját és munkaóráit látja.  
**Munkaidő-nyilvántartás:** A rendszerben rögzített munkaórák, amelyeket az alkalmazottak bejegyeznek és az adminisztrátorok jóváhagyhatnak.  
**Projektmenedzsment:** A projektek, feladatok és azok állapotának kezelése a rendszerben.
