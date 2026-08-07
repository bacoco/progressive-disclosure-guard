# Contexte : proposition d'enrichissement du PDG

## Qu'est-ce que le PDG

Le Progressive Disclosure Guard est un skill pour Claude Code et Codex CLI qui intervient avant la finalisation de tout livrable à risque (spec, plan, code, review, migration). Il force l'agent à :

1. Identifier ce qui existe et doit être préservé
2. Classifier ce qui est connu vs inconnu (matrice Rumsfeld)
3. Exiger une preuve réelle avant de déclarer « fait »

Repository : https://github.com/bacoco/progressive-disclosure-guard
Fork Alex : https://github.com/Alexmacapple/progressive-disclosure-guard

Le skill fait 248 lignes, est le plus dense et le plus mature du workspace. Il est généré depuis `pdg.skill.md` via `pdg generate-skills` pour produire des variantes Claude et Codex.

---

## Diagnostic

Après analyse complète du skill en contexte d'usage réel (workspace avec 68+ skills, projets hébergés, wiki auto-évolutif), 4 obstacles opérationnels ont été identifiés :

### 1. Pas de résumé exécutif

Un agent qui charge le skill pour la première fois doit absorber 248 lignes avant de savoir quoi faire. Pas de raccourci. Les sections `Invariants` (Always/Never) sont puissantes mais pas un point d'entrée.

**Impact** : sur-inspection (l'agent lit tout avant d'agir) ou sous-inspection (l'agent survole et rate l'essentiel).

### 2. Exemples trop tranchés

Les 3 cas actuels :
- `Refactor auth flow` → triggered (évident)
- `Install PDG here for Codex` → triggered (évident)
- `Fix README typo` → not triggered (évident)

Les cas limites ambigus — là où la valeur du PDG est maximale — ne sont pas illustrés. Un agent face à « rename 5 CSS variables across 8 files » ne sait pas quel niveau de pass appliquer.

**Impact** : sur-trigger (PDG complet pour du cosmétique multi-fichier) ou sous-trigger (skip sur un changement d'1 fichier mais contractuel).

### 3. Profondeur d'inspection non bornée

La section Overlap Inspection Pass dit « Inspect existing code, scripts, skills, agents, hooks, configs and tests with rg or focused reads » sans borne de profondeur.

**Impact** : un agent consciencieux peut scanner 50 fichiers (coûteux, lent), un agent pressé en scanne 0 (dangereux).

### 4. Arbre de décision implicite

3 sous-workflows existent (Skill Invocation Pass, Overlap Inspection Pass, Documentation Review Passes) mais le choix de quand appliquer lequel est implicite dans le texte.

**Impact** : un agent applique systématiquement les 3 passes même quand une seule suffit, ou n'en applique aucune par confusion.

---

## Propositions concrètes

### P1 — Résumé exécutif (5-7 lignes)

Insérer après le titre `# PDG`, avant les sections existantes :

```markdown
## En bref

Le PDG vérifie qu'un livrable est prêt à être finalisé. Il force 3 choses :
(1) identifier ce qui existe et doit être préservé,
(2) classifier ce qui est connu vs inconnu,
(3) exiger une preuve réelle avant de déclarer « fait ».

Trigger : diff > 3 fichiers, contrat public, comportement partagé, handoff.
Non-trigger : typo, formatting, lookup, statut.
```

**Justification** : un agent low-context sait en 5 lignes ce qu'on attend de lui. La densité du reste n'est pas réduite.

### P2 — Cas limites ambigus (2 exemples)

Ajouter dans la section Examples :

```markdown
Input: `Rename 5 CSS variables for consistency across 8 files.`
PDG output: triggered (8 files), but minimal pass: confirm no component depends on the old names by grep, then list preserved behavior. No full overlap inspection needed.

Input: `Change the default timeout from 30s to 60s in config.ts.`
PDG output: triggered (1 file, but behavior change other modules depend on). MUST name which callers rely on the timeout, verify no test assumes 30s, and confirm the change doesn't mask a real performance issue.
```

**Justification** : ces cas montrent que le trigger ne dépend pas du nombre de fichiers mais de l'impact comportemental. Ils illustrent aussi que le PDG peut être « minimal pass » — pas toujours full inspection.

### P3 — Profondeur d'inspection bornée

Ajouter dans la section Overlap Inspection Pass :

```markdown
Inspection depth: read files named in the diff + 1 level of direct dependents (importers, callers, config consumers). Do not recurse beyond that unless a specific risk justifies it. If the direct-dependent set exceeds 20 files, sample the 5 most-coupled and mark the rest `inspection bounded, residual risk noted`.
```

**Justification** : borne explicite qui empêche la dérive en largeur tout en nommant le mécanisme de gestion quand le graphe est large (sampling + marquage du risque résiduel).

### P4 — Arbre de décision (fichier annexe, candidat optionnel)

Ce livrable est plus discutable pour upstream — il pourrait être local uniquement ou dans un `docs/` upstream.

```markdown
# Arbre de décision des sous-workflows PDG

## Quand appliquer quel pass

| Situation | Pass requis | Passes optionnelles |
|-----------|-------------|---------------------|
| Diff touche un skill ou en invoque un | Skill Invocation Pass | Overlap si le skill touche d'autres fichiers |
| Diff modifie du code existant | Overlap Inspection Pass | Documentation Review si handoff doc |
| Diff produit ou modifie de la documentation | Documentation Review Passes | Overlap si la doc décrit du code |
| Diff crée un nouveau fichier > 200 lignes | Overlap (vérifier qu'il ne duplique pas) | — |
| Diff est purement cosmétique mais multi-fichier | Aucun pass complet | Grep des anciens noms suffit |

## Schéma de décision

1. Le diff change-t-il un COMPORTEMENT observable ?
   - Non → pas de full pass (grep suffisant pour vérifier l'absence de casse)
   - Oui → continuer

2. Le comportement changé est-il consommé par d'autres modules ?
   - Non → Overlap minimal (1 niveau)
   - Oui → Overlap complet (diff + dépendants directs)

3. Le diff produit-il un livrable de handoff (doc, spec, plan, install) ?
   - Non → pas de Documentation Review
   - Oui → les 3 passes (coverage, grounding, regression)

4. Le diff implique-t-il un skill ?
   - Non → pas de Skill Invocation Pass
   - Oui → Skill Invocation Pass obligatoire
```

---

## Positionnement du PDG dans l'écosystème

Le PDG est le garde-fou de SORTIE dans un système de gouvernance à 4 skills :

```
ENTRÉE (prompt brut)
    │
    ▼
┌──────────────────┐
│ prompt-governor  │ ← reformule le prompt
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌──────────────┐
│ goal-  │  │ governed-    │
│ manager│  │ executor     │
│(délègue)│  │(exécute)     │
└────┬───┘  └──────┬───────┘
     │              │
     └──────┬───────┘
            │
            ▼
┌──────────────────────────────┐
│           PDG                 │
│  (vérifie avant livraison)   │
└──────────────────────────────┘
            │
            ▼
       LIVRAISON
```

- `prompt-governor` : garde-fou d'entrée (le prompt est-il clair ?)
- `goal-manager` : garde-fou de délégation (le contrat est-il verrouillé ?)
- `governed-executor` : garde-fou d'exécution (l'action suit-elle le prompt gouverné ?)
- **PDG** : garde-fou de sortie (le résultat est-il prêt à être finalisé ?)

---

## Concepts sous-jacents (wiki Alex)

Le PDG implémente opérationnellement plusieurs concepts documentés :

- **Les dix cercles vicieux de l'agentivité** — taxonomie de pannes (Asimov → prompt-governor → PDG). Le PDG empêche les cercles 4 (vérification désactivée), 7 (déviation silencieuse) et 9 (plus grand bien silencieux).
- **Discipline PROUVÉ/PLAUSIBLE/INCONNU** — la matrice `claim/source/verdict/impact` du PDG est l'implémentation de cette discipline.
- **Boucle qualité traçable** — le PDG est la dernière étape (re-vérification formelle) du cycle détection → PRD → review → implémentation → vérification.
- **Principes éditoriaux Shannon/Saint-Exupéry** — « progressive disclosure » = Saint-Exupéry appliqué à l'architecture (ne montrer que ce qui est nécessaire à chaque niveau).
- **Programmation par intent** — le PDG ne dicte pas la méthode, il vérifie que le contrat de résultat est respecté.

---

## Questions ouvertes pour avis

1. **P1-P3 dans `pdg.skill.md` upstream** : est-ce que ces ajouts (résumé + exemples + bornage) sont universellement utiles ou trop spécifiques au contexte Alex ?
2. **P4 en `docs/` upstream ou local uniquement** : l'arbre de décision aide-t-il un utilisateur générique ou est-ce une surcharge ?
3. **Budget lignes** : le source fait 242 lignes. Avec P1+P2+P3 on ajoute ~20 lignes (→ 262). Acceptable ? Ou faut-il compenser en condensant ailleurs ?
4. **Risque de « sur-gouverner le gouverneur »** : est-ce qu'ajouter un bornage (P3) et un arbre (P4) ne contredit pas la philosophie « assume the next implementer is rushed » en ajoutant de la charge cognitive ?

---

## Forme de contribution envisagée

- PR depuis fork `Alexmacapple/progressive-disclosure-guard` vers `bacoco/progressive-disclosure-guard`
- Branch : `feature/operational-enrichment`
- Scope : P1 + P2 + P3 dans `pdg.skill.md`
- P4 optionnel : soit dans un `docs/decision-tree.md` upstream, soit local uniquement selon avis
