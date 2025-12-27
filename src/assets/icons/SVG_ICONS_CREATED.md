# SVG-ikoner - Implementerade

Du har nu ett komplett set av anpassade SVG-ikoner designade enligt Montessori-filosofi med mjuka, barnvänliga färger!

## 📚 Skapade ikoner (6 st)

### 1. **brush-teeth.svg** - Borsta tänder ✨
- Tandborste i mjuk brun (#c9a583)
- Mjuka tandborsteborst i turkost (#9dd4c3)
- Tandkräm i rosa (#f0b3d6)
- Minimalistisk, tydlig design för barn 3-10 år

### 2. **eat-breakfast.svg** - Äta frukost 🍽️
- Skål med mjölk i beige (#fce4d1)
- Cerealier/fruktbitar i varma bruntoner
- Sked i samma material som tandborsten
- Mjölksplasch för rörelseeffekt

### 3. **get-dressed.svg** - Klä på dig 👕
- T-shirt i turkost (#9dd4c3)
- Armhål och släta former
- Subtil färgvariering på bröstet
- Enkelt och barnvänligt

### 4. **read-book.svg** - Läsa bok 📖
- Hardcover-bok i varmt brunt (#d89860)
- Öppna sidor på höger sida
- Boköverdrag med dekorativa cirklar
- Bokmärke i rosa (#f0b3d6)

### 5. **take-shower.svg** - Duscha 🚿
- Badkar i beige (#e8d9cc)
- Vattendroppar i turkost (#b5e5d0)
- Barn i badet (förenklad figur)
- Vattensprut för action

### 6. **bedtime.svg** - Sovdags 🌙
- Säng med huvudgavel
- Kudde och täcke
- Nallebjörn på sängen för mysighet
- Små stjärnor för nattlig känsla

## 🎨 Färgpalett (konsekvent)

```
Ljus bakgrund:    #f5f1ed (off-white/beige)
Primär brun:      #c9a583 (vardagsmaterial)
Mörkare brun:     #a58a70 (detaljer)
Turkost/grön:     #9dd4c3 (vatten, aktiviteter)
Rosa accent:      #f0b3d6 (tandkräm, bokmärke)
Varmbrunt:        #d89860 (kaffe, böcker)
```

## 🔧 Integration

Alla ikoner är redan integrerade i:
- `/src/utils/icons.ts` - Definerade med `svgPath`
- `/src/components/IconDisplay.tsx` - Laddar och visar SVG
- `/src/routine.ts` - Standardrutiner använder nya ikoner

## ✨ Design-filosofi

- ✅ Flat-style, minimalistisk
- ✅ Montessori-aligned (lugn, ordnad)
- ✅ Barnvänlig (3-10 år)
- ✅ Soft shadows, ingen gradient
- ✅ 2D, skalbar
- ✅ Mjuka, varma färger
- ✅ Intuitiv och tydlig

## 📱 Visuell rendring

Ikonerna visas som:
1. **SVG** när de är tillgängliga (skarpt, skalbart)
2. **Emoji fallback** om SVG inte kan laddas
3. **Konsekvent storlek** i alla gränssnitt

## 🚀 Nästa steg (valfritt)

### Skapa fler ikoner
Ge mig beskrivning av aktivitet och jag skapar SVG:
```
"Jag vill ha en ikon för 'Matematiklektioner' som visar..."
```

### Anpassa färger
Alla färger kan enkelt ändras genom att uppdatera HEX-värdena i SVG-filerna.

### Exportera som PNG
Alla SVG:er kan exporteras till PNG för iOS-appen:
```bash
# Exempel med ImageMagick:
convert brush-teeth.svg -resize 512x512 brush-teeth.png
```

---

Ikonerna är nu live i din app och kan ses när du kör rutiner! 🎉
