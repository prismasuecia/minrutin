# Icon Library

Det här är mappen för att lagra ikonbibliotek för "Min Rutin"-appen.

## 📁 Befintliga SVG-ikoner

Du har redan 6 anpassade SVG-ikoner designade enligt Montessori-filosofi:

1. **brush-teeth.svg** - Borsta tänder ✨
2. **eat-breakfast.svg** - Äta frukost 🍽️
3. **get-dressed.svg** - Klä på dig 👕
4. **read-book.svg** - Läsa bok 📖
5. **take-shower.svg** - Duscha 🚿
6. **bedtime.svg** - Sovdags 🌙

Se `SVG_ICONS_CREATED.md` för detaljer om varje ikon.

## 🎨 Färgpalett

Alla ikoner använder denna konsekvent färgpalett:

- **#f5f1ed** - Ljus bakgrund (off-white)
- **#c9a583** - Vardagsmaterial (brun)
- **#9dd4c3** - Vatten/aktiviteter (turkost)
- **#f0b3d6** - Accent (rosa)
- **#d89860** - Varmt material (brunt)

## System för ikonhantering

### Filstruktur
- **`/src/utils/icons.ts`** - Ikonkonfiguration
- **`/src/components/IconSelector.tsx`** - Väljare-komponent
- **`/src/components/IconDisplay.tsx`** - Visnings-komponent
- **`/src/assets/icons/`** - (denna mapp) För SVG-ikoner

### Hur det fungerar

1. **SVG-ikoner** lagras här och refereras i `icons.ts`
2. **IconDisplay** laddar SVG:er på-demand
3. **IconSelector** visar alla tillgängliga ikoner
4. **Fallback** till emoji om SVG inte kan laddas

## 🚀 Lägg till nya SVG-ikoner

### Steg 1: Spara SVG-filen
Placera din SVG i denna mapp (t.ex. `my-icon.svg`)

### Steg 2: Uppdatera `icons.ts`
Redigera `/src/utils/icons.ts` och lägg till:

```typescript
{ 
  name: "my-icon", 
  label: "Min aktivitet", 
  emoji: "🎯", 
  category: "Min kategori",
  svgPath: "/src/assets/icons/my-icon.svg"
}
```

### Steg 3: Använd ikonväljaren
Öppna Föräldraläge och välj din nya ikon!

## 📋 SVG Design-riktlinjer

För att hålla konsistensen, följ dessa riktlinjer när du skapar nya ikoner:

### Mål
- ViewBox: `0 0 512 512`
- Bakgrund: `<rect width="512" height="512" rx="80" fill="#f5f1ed"/>`
- Skugga: `<ellipse cx="256" cy="480" rx="140" ry="20" fill="#e8e0d8" opacity="0.3"/>`

### Stil
- Flat-design, inga gradienter
- Mjuka skuggor för djup
- Enkla, geometriska former
- Barnvänlig (3-10 år)
- Montessori-inspirerad (lugn, ordnad)

### Färger (använd dessa HEX-värden)
```
#f5f1ed - Bakgrund
#c9a583 - Primär brun
#a58a70 - Mörkare brun
#9dd4c3 - Turkost/grön
#f0b3d6 - Rosa accent
#d89860 - Varmt brunt
#b5e5d0 - Ljus turkost
```

## 💡 Tips

### Skapa konsistenta ikoner
- Använd samma linjestorlek (`stroke-width`)
- Håll samma rundningRadius (`rx`, `ry`)
- Var konsekvent med element-ordning (bakgrund → skugga → detaljer)

### Enkla former
- `<circle>` för runda element
- `<rect>` för kvadratiska element
- `<ellipse>` för vertikala/horisontala former
- `<path>` för komplexa kurvor

### Tillgänglighet
- Lägg alltid till `title` attribut för SVG
- Test med barn för att säkerställa att det är tydligt

## 🎯 Framtida idéer

1. **Animerade ikoner** - Lägg till `<animate>` för rörelse
2. **Dark mode** - Anpassa färger för mörkare UI
3. **Högupplösta versioner** - Exportera som PNG för iOS
4. **Ikon-set** - Skapa tema-baserade ikonuppsättningar

---

Se även:
- `SVG_ICONS_CREATED.md` - Detaljer om skapade ikoner
- `EXAMPLES.md` - Exempel på ikonnamn och kategorier
- `/src/utils/icons.ts` - Ikonkonfiguration

