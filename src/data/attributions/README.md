# Attribution boundary

Keep correspondence systems out of `treeTopology.js`.

Future attribution records should identify, at minimum:

- `systemId` (for example a specific Golden Dawn / Crowley / Sepher Yetzirah schema)
- source / edition
- table, chapter, folio, column, or other locator
- the exact graph edge or Sephirah being attributed
- the atomic claim (letter, path number, Tarot trump, planet, zodiac sign, color scale, divine name, etc.)
- confidence / dispute notes where sources diverge

The application should be able to switch attribution systems without mutating the graph.
