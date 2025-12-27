# Snabbstartsguide - Ikonhantering

## 🎯 Din nya ikoninfrastruktur är redo!

Du kan nu välja ikoner för aktiviteter direkt i appen. Här är hur:

### Steg 1: Öppna Föräldraläge
- Håll på **barnets namn** i toppen av skärmen i **2 sekunder**

### Steg 2: Gå till Rutiner
- Du bör nu vara i Föräldraläge
- Klick på ett barn för att välja det
- Bläddra ned till **"Rutiner"**

### Steg 3: Redigera en Rutin
- Klick på **"Spara ändringar"**-knappen (eller redigera aktiviteter)
- Du ser nu en **liten rund knapp** bredvid varje aktivitet (med ett emoji)

### Steg 4: Välj Ikon
- **Klick på emojin** för att öppna ikonväljaren
- Välj en ikon från listan
- **Klick "Spara ändringar"** för att spara

## 📦 Vad är nu installerat?

- ✅ **26 fördefinierade ikoner** organiserade efter kategori
- ✅ **Ikonväljare-modal** med sökfunktion
- ✅ **Automatisk spara** av ikonval
- ✅ **Fullständig infrastruktur** för framtida SVG-ikoner

## 🚀 Nästa steg: Lägg till egna ikoner

Om du senare vill lägga till nya ikoner, redigera bara denna fil:

**`/src/utils/icons.ts`**

Lägg till en ny rad i `AVAILABLE_ICONS`-arrayen:

```typescript
{ 
  name: "ny-ikon", 
  label: "Min aktivitet", 
  emoji: "🎯", 
  category: "Min kategori" 
}
```

Det är allt! Den nya ikonen är automatiskt tillgänglig!

## 📚 Dokumentation

- **`ICON_SYSTEM_SETUP.md`** - Fullständig dokumentation
- **`/src/assets/icons/README.md`** - Detaljerad guide
- **`/src/assets/icons/EXAMPLES.md`** - 50+ exempel på ikoner du kan lägga till

## 💡 Tips

- **SF Symbols-namn**: `bed.double`, `sun.max.fill`, `book.fill`, etc.
- **Emojis**: Måste vara relevanta för aktiviteten
- **Kategorier**: Hjälper till att organisera ikonväljaren
- **Utan ikon**: Klick "Ingen ikon" för att ta bort en ikon

---

**Klar att börja?** 🎉
1. Öppna Föräldraläge
2. Klick på emojin bredvid en aktivitet
3. Välj en ikon
4. Njut av din nya ikonfunktion!
