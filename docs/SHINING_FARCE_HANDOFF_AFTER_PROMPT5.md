# SHINING FARCE PROJECT HANDOFF

## Design + Architecture State after Codex Prompt #5 and Mage Design Pass

**Prepared:** 2026-09-15\
**Purpose:** Authoritative handoff for a fresh ChatGPT design-room
instance. Use this document to prevent design drift and resurrection of
superseded ideas.

------------------------------------------------------------------------

# 1. OPERATING RULES FOR THE NEXT CHAT

This is a design-room project for an expandable Game Boy-style
tactical/strategic RPG called **Shining Farce**.

**Do not implement code unless the user explicitly asks.** When
implementation is requested, normally produce a precise Codex-ready
implementation prompt that extends the existing prototype rather than
rewriting it.

Always distinguish:

-   **FINALIZED** --- explicitly accepted design or implemented rule.
-   **PROVISIONAL/TUNABLE** --- current design direction/value,
    intentionally balance-tunable.
-   **DEFERRED/TBD** --- not yet decided; do not invent a value.
-   **SUPERSEDED** --- old idea that must not be resurrected.

When a new statement conflicts with an older
spreadsheet/report/proposal, the latest explicit user decision wins.
Codex implementation reports describe what exists in code; they do not
automatically supersede later design decisions.

The project must remain:

**ZIP → extract → double-click `index.html` → play**

No server, install, npm/build step, modules, remote dependencies, or
fetch requirement. Use classic scripts, vanilla JavaScript,
`window.GBTRPG`, external PNG assets, a 320×240 logical framebuffer, and
the strict five-green palette.

------------------------------------------------------------------------

# 2. IMPLEMENTATION MILESTONE

## Codex Prompt #5 --- COMPLETE

Latest implementation report: **PROMPT5-IMPLEMENTATION.md**

Reported result:

-   **362/362 automated checks pass**
-   all **266 prior checks** retained
-   **96 new checks**
-   offline rendering/input verification passes
-   save schema advanced from **5 → 6**
-   classic local-script runtime preserved
-   no new runtime/package dependency
-   direct browser `file://` launch was not re-verified because the
    automation environment rejects local-file navigation, but the
    local-file architecture was preserved

Prompt #5 added/extended foundations for:

-   standardized ability CP costs
-   class-entry Current CP grants
-   execution receipts and CP attribution
-   Archer
-   Alchemist
-   generic ability weapon requirements
-   Quick Items
-   Trade
-   hidden battlefield items / Scrounger
-   consolidated MAGIC grouping
-   spell-family / spell-level metadata
-   future spell-modifier selection
-   WAND and ROBE equipment-family vocabulary
-   finalized current class growth values

## Verification judgment

The Prompt #5 report substantially matches the requested implementation.

Important confirmations:

1.  The requested ability-price curve is implemented exactly.
2.  Lifetime CP and Current CP remain separate.
3.  Ability purchases reduce Current CP only.
4.  CP may continue accumulating after Class Lv10.
5.  Universal actions credit the current class.
6.  Current-class Action Abilities credit the current class.
7.  Secondary-class Action Abilities split CP between current class and
    owning class.
8.  STEAL is correctly treated as a Thief-owned Action Ability rather
    than a universal action.
9.  Reaction/Support/Movement effects do not independently award CP.
10. Actual CP award amounts remain unresolved rather than being silently
    set to 10 or another value.
11. Class-entry CP grants are optional rather than universal.
12. No currently shipped class receives an initial grant.
13. Archer and Alchemist were added without fabricating unresolved
    numerical effects.
14. One consolidated MAGIC grouping exists structurally without shipping
    an unfinished Mage/Wizard class.
15. Weapon requirements retain owning-class/secondary-action semantics.
16. Wands/Robes were added only as vocabulary/selectors; their combat
    statistics were not fabricated.
17. Trade's successful Major Action cost remains unresolved.
18. Existing regression checks remain passing.

### Caveats to remember

The report explicitly says many Archer/Alchemist abilities are
**hooks/metadata, not complete tactical combat executions**. Complete
combat, reaction scheduling, spell casting, HP/status application,
item-action menus, AI, and merging detached tactical mutations into
campaign BattleResults remain development boundaries.

The existing item catalog still has **no bow entries and no established
equipment weight tiers**. Archer is structurally implemented but does
not yet have real configured bow equipment in the shipping catalog.

The report says Covering Fire's `activationLimit: null` is intentionally
interpreted as **no cap**, not "unknown cap."

------------------------------------------------------------------------

# 3. CAMPAIGN / TECHNICAL BASELINE

## FINALIZED / implemented foundations

-   Campaign world is a graph of locations.
-   End Day resolves strategic activity simultaneously.
-   Strategic squads contain at most **12 units**.
-   The overall roster can be larger than a squad.
-   Strategic squad sprite is derived from roster slot 1.
-   Stationing belongs to location state.
-   Economy, recruitment, inventory, delivery/logistics, supply wagons,
    and physical item-instance ownership are implemented foundations.
-   Save schema is now **6**.
-   Battle maps use a square grid.
-   Tactical unit footprint is one tile, including centaurs.
-   Standard battle-map tile: **16×16 px**.
-   Standard tactical unit sprite: **16×16 px**.
-   Logical display: **320×240**.
-   Strict five-green framebuffer palette.
-   External PNG asset structure.
-   Classic local scripts.

Do not expand graphical scope toward SNES/Genesis presentation. The
project deliberately uses a Game Boy-like scope.

------------------------------------------------------------------------

# 4. CHARACTER STATS AND GROWTH

## FINALIZED stat meanings

Growing stats:

-   **STR** --- melee physical damage.
-   **DEX** --- ranged physical damage.
-   **CON** --- MAX HP and physical debuff resistance/recovery.
-   **AGI** --- turn order, dodge, single-target spell dodge, and basis
    for double attack.
-   **INT** --- MAX MP and spell damage.
-   **WIS** --- healing and buff/debuff resistance.

**MOV and DEF are non-growing stats.**

Character Level and Class Level are separate.

Each Character Level growth event adds:

**random racial growth + fixed current-class growth bonus**

Past growth is permanent. Changing class affects future growth only.

## Class growth shorthand

-   small = **+1**
-   medium = **+2**
-   large = **+3**

## FINALIZED current class growth

-   Fighter: **+1 STR**
-   Knight: **+1 STR, +1 CON**
-   Thief: **+1 AGI**
-   Archer: **+1 DEX**
-   Alchemist: **+1 WIS**

## Current magic-class growth concepts

These are design concepts unless separately finalized later:

-   Mage: **+1 INT**
-   Cleric: **+1 WIS**
-   Hexer: **+2 WIS, +1 CON**
-   Enchanter: **+2 INT, +1 AGI**
-   Wizard: **+2 INT**
-   Elementalist: **+3 INT**
-   Paladin: **+3 STR, +2 CON, +1 WIS**

Summoner was once described as having "medium MP growth." This conflicts
with the six-stat growth architecture because MP is derived rather than
a growing stat. **TBD; do not invent a resolution.**

------------------------------------------------------------------------

# 5. CLASS LEVEL / CP ARCHITECTURE

## Lifetime CP thresholds --- implemented, currently PROVISIONAL/TUNABLE

-   Lv1: **0**
-   Lv2: **100**
-   Lv3: **250**
-   Lv4: **450**
-   Lv5: **700**
-   Lv6: **1000**
-   Lv7: **1350**
-   Lv8: **1750**
-   Lv9: **2200**
-   Lv10: **2700**

Thus total Lifetime CP required to reach Class Lv10 is **2700**, not
2750.

`classProgress[classId]` tracks:

-   `lifetimeCP`
-   `currentCP`
-   `classLevel`
-   schema-6 class-entry-grant processing state

Lifetime CP determines Class Level and never decreases.

Current CP is spendable.

Earning CP adds to Lifetime CP and Current CP.

Purchasing abilities reduces Current CP only.

Both balances can continue increasing after Class Lv10, allowing
eventual total mastery through grinding.

## FINALIZED ability purchase cost curve

Default cost is determined by the ability's required Class Level:

-   Lv1: **100 CP**
-   Lv2: **125 CP**
-   Lv3: **150 CP**
-   Lv4: **175 CP**
-   Lv5: **200 CP**
-   Lv6: **225 CP**
-   Lv7: **250 CP**
-   Lv8: **275 CP**
-   Lv9: **300 CP**
-   Lv10: **350 CP**

Explicit per-ability overrides are architecturally possible. Explicit
`null` remains unresolved/unpurchasable. The current shipped abilities
use the default curve.

Reaching a Class Level does **not** automatically teach the abilities
unlocked there.

## CP award amount --- DEFERRED/TBD

The actual amount of CP awarded per executed action is **not
finalized**.

A possible **10 CP per action** was discussed but deliberately NOT
accepted as a rule and was NOT implemented.

Success/failure may eventually affect the numerical award; that remains
part of the replaceable CP award calculator.

## FINALIZED CP attribution semantics

Do not confuse **top-level command category** with **ability
ownership**.

### Universal actions

Examples currently include ordinary:

-   ATTACK
-   ITEM
-   EQUIP
-   TRADE when it eventually resolves as an execution

A qualifying universal action gives **100% of its CP to the unit's
current class**.

Example: Fighter uses Item → 100% Fighter CP.

### Current-class Action Ability

If an Action Ability belongs to the current class → **100% current-class
CP**.

### Secondary-class Action Ability

If an Action Ability belongs to the equipped Secondary Action class:

-   current class receives `ceil(CP / 2)`
-   owning secondary class receives `floor(CP / 2)`

Example: Alchemist with Fighter Secondary uses Power Attack for 11 CP:

-   Alchemist +6
-   Fighter +5

### CRITICAL STEAL EXAMPLE

**Steal is not universal.**

Steal Item / Accessory / Off-Hand / Weapon / Armor are **Thief Action
Abilities** grouped under the STEAL command.

Fighter with Thief Secondary using Steal Weapon → CP is split
Fighter/Thief.

Likewise, future spells are class-owned Action Abilities even though
they are consolidated under MAGIC.

Reaction, Support, and Movement abilities do not independently generate
CP merely because they trigger or modify something.

------------------------------------------------------------------------

# 6. CLASS-ENTRY CURRENT-CP GRANTS

Prompt #5 implemented an optional one-time class-entry grant mechanism.

## FINALIZED generic rule

-   Default: **no grant**.
-   A class may explicitly define an initial Current CP grant.
-   Grant affects **Current CP only**.
-   It does not increase Lifetime CP or Class Level.
-   It occurs only once per character/class.
-   Switching away/back does not repeat it.
-   Save/load does not repeat it.
-   Migration marks prior access as processed without retroactively
    handing out free CP.

## Current shipped classes

Fighter, Knight, Thief, Archer, and Alchemist currently receive **no
grant**.

## Mage design decision after Prompt #5

Mage is intended to receive **100 initial Current Mage CP without
Lifetime CP**, once per character, because a spell-less Mage cannot
perform its intended role.

This is **DESIGNED BUT NOT YET IMPLEMENTED**, because Mage was
intentionally not shipped in Prompt #5.

The purpose is to let a new Mage purchase exactly one Lv1 elemental
spell under the 100-CP Lv1 price.

Do not generalize this to every class.

------------------------------------------------------------------------

# 7. ABILITY LOADOUT / ACTION ECONOMY

## FINALIZED loadout model

Purchased abilities can be equipped through:

-   **Primary Action** --- current class's purchased Action set.
-   **Secondary Action** --- one other class's purchased Action set.
-   **one Reaction**
-   **one Support**
-   **one Movement**

Only executed Action Abilities participate in Action-Ability CP
ownership rules. Reaction/Support/Movement influences do not
independently award CP.

## Major Action model

Normally one Major Action per turn.

Major Action concepts include:

-   Attack
-   Magic
-   Steal
-   Item
-   Equip

Skills are a separate menu category below Attack and above Magic.
Individual Skills specify whether they consume the Major Action.

Attack/items do not inherently end the turn. A unit may continue moving
if MOV remains and the rules permit it.

Equip = one equip/unequip item operation and consumes the Major Action.

Some ability Major Action costs remain explicitly TBD.

------------------------------------------------------------------------

# 8. UNIVERSAL COUNTERATTACK / DOUBLE ATTACK

## FINALIZED universal counterattack concept

All units have a small chance to counterattack if the attacker is within
legal range of the counterattacking unit's weapon.

Exact universal chance remains TBD.

Fighter's Counter increases that chance.

## Double attack

Eligible attacks may attack twice if AGI is sufficiently higher.

-   exact AGI formula TBD
-   final chance cap: **90%**
-   Steal never double-attacks
-   Flurry greatly boosts double-attack chance
-   counterattacks, ordinary Attack, second attacks, reaction-generated
    attacks, Skills, and Steal are distinct concepts
-   double-attack eligibility must be explicit per action

------------------------------------------------------------------------

# 9. EQUIPMENT / ABILITY REQUIREMENT ARCHITECTURE

Prompt #5 implemented shared selectors for:

-   slots
-   weapon families
-   weights
-   melee/ranged kinds
-   tags
-   exact metadata

**Secondary Action access never bypasses equipment requirements.**

Backstab uses metadata such as SHORT/STABBING rather than hard-coded
item names.

Archer Action abilities require an eligible bow.

Future spellcasters have WAND and ROBE vocabulary available, but Wand
combat formulas and real Wand/Robe catalog statistics remain TBD.

------------------------------------------------------------------------

# 10. FIGHTER

**Status:** Design established; Prompt #4/#5 foundation exists.\
**Growth:** +1 STR.\
**Equipment:** medium melee weapons + medium armor.

  ------------------------------------------------------------------------------------------------------------------------------------------------
  Category   Lv1        Lv2             Lv3             Lv4          Lv5       Lv6               Lv7        Lv8               Lv9           Lv10
  ---------- ---------- --------------- --------------- ------------ --------- ----------------- ---------- ----------------- ------------- ------
  Action     Power      ---             Feint --- 80%   Follow       ---       Psyche Up ---     ---        Cleave / Thrust / ---           ---
             Attack ---                 normal damage,  Through ---            other ally only;             spear technique                 
             stronger                   substantially   if no attack           dramatic                     ---                             
             melee,                     higher hit;     yet and ≥1             physical-attack              weapon-specific                 
             lower hit;                 exact accuracy  MOV, make              boost until end              techniques.                     
             exact                      TBD.            normal melee           of target's next             Cleave secondary                
             values                                     attack; if             turn; magnitude              damage TBD;                     
             TBD.                                       kill, enter            and Major Action             Thrust = 80%                    
                                                        target                 status TBD.                  damage and                      
                                                        square if                                           ignores 80% DEF;                
                                                        able and may                                        spear technique                 
                                                        make regular                                        name TBD,                       
                                                        Attack                                              adjacent target                 
                                                        against                                             normal + behind                 
                                                        another                                             target 80%.                     
                                                        enemy in                                                                            
                                                        range;                                                                              
                                                        once/turn.                                                                          
                                                        Major Action                                                                        
                                                        status TBD.                                                                         

  Reaction   ---        Counter ---     ---             ---          ---       ---               ---        ---               ---           ---
                        increases                                                                                                           
                        universal legal                                                                                                     
                        counterattack                                                                                                       
                        chance; amount                                                                                                      
                        TBD.                                                                                                                

  Support    ---        ---             ---             ---          Evasive   Medium Weapon     Strength   ---               Battlefield   ---
                                                                     Stance    Training.         Training                     Awareness --- 
                                                                     ---                         --- future                   immune to     
                                                                     command                     STR                          friendly      
                                                                     ends                        growth;                      offensive AoE 
                                                                     turn,                       bonus TBD.                   magic; Medium 
                                                                     small                                                    Armor         
                                                                     dodge                                                    Training.     
                                                                     boost                                                                  
                                                                     until                                                                  
                                                                     next                                                                   
                                                                     turn;                                                                  
                                                                     amount                                                                 
                                                                     TBD.                                                                   

  Movement   ---        ---             ---             ---          ---       ---               ---        ---               ---           Move
                                                                                                                                            +1.
  ------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 11. KNIGHT

**Prerequisite:** Fighter Lv3.\
**Growth:** +1 STR, +1 CON.\
**Equipment:** medium/heavy melee, medium/heavy armor, shields.

Key established abilities:

-   Lv1 Action Shield Bash --- shield required, low damage, **75%
    Stun**.
-   Lv2 Reaction Guard --- chance based on shield to substantially
    reduce incoming attack; reduction TBD.
-   Lv3 Support Chivalry --- adjacent/diagonal allies +DEF equal to **5%
    Knight total DEF**, dynamic.
-   Lv4 Action Protect --- swap with friendly; all remaining MOV
    consumed; no more voluntary movement; once/turn.
-   Lv4 Support Heavy Weapon Training.
-   Lv5 Reaction Cover --- **50%** chance to take adjacent ally's
    physical attack.
-   Lv6 Support Two-Handed --- no shield/off-hand; doubles equipped
    weapon's **ATK stat only**.
-   Lv7 Action Crushing Blow --- add target's full DEF to attack damage,
    then halve target DEF for resolution; preserve as two operations.
-   Lv7 Support Constitution Training --- future CON growth; bonus TBD.
-   Lv8 Support Equip Shields.
-   Lv8 Movement Steadfast --- immune to enemy-caused forced
    displacement.
-   Lv9 Action Hold the Line --- choose two adjacent squares enemies
    cannot enter until next turn; MOV→0/no voluntary movement; other
    nonmovement actions allowed; ends if Knight leaves.
-   Lv9 Support Heavy Armor Training.
-   Lv10 Support Indomitable --- at ≤ceil(10% MAX HP), individual damage
    source ≤ceil(50% MAX HP) becomes 0; larger damage resolves normally.

------------------------------------------------------------------------

# 12. THIEF

**Growth:** +1 AGI.\
**Class MOV:** +2.\
**Equipment:** light weapons, light armor, light bows.

## IMPORTANT SUPERSEDED ARTIFACT WARNING

An older spreadsheet contains a Thief Lv3 Reaction named **Evade**. This
was not part of the authoritative conversation design and must **not**
be treated as settled merely because it appears in an old workbook/code
artifact. Verify with the user before retaining it in future design
work.

Established Thief abilities:

### Action

-   Lv1 Steal Item
-   Lv2 Steal Accessory
-   Lv3 Steal Off-Hand
-   Lv4 Steal Weapon
-   Lv5 Steal Armor
-   Lv9 Backstab --- requires eligible short stabbing weapon; if
    friendly is directly opposite Thief across target on same
    row/column, 150% normal damage; otherwise normal melee attack.

### Reaction

-   Lv6 Slip Away --- after being struck by adjacent enemy, chance TBD;
    player chooses legal adjacent square or no move; no MOV cost.

### Support

-   Lv4 Fast Hands --- doubles calculated Steal chance.
-   Lv6 Skirmisher --- moved ≥3 actual tiles → DEF bonus on turn end
    until next turn; bonus TBD.
-   Lv7 Flurry --- greatly boosts double-attack chance; universal cap
    90%.
-   Lv8 Disarm --- permits Steal with full inventory; successful
    equipment Steal without room unequips item but victim retains it.
-   Lv9 Escape Artist --- improves survival after squad defeat; modifier
    TBD.
-   Lv10 Deep Pockets --- inventory +1.

### Movement

-   Lv10 Fleet-Footed --- consecutive perpendicular orthogonal steps
    forming diagonal displacement cost 1 MOV total instead of 2; both
    component moves must be legal; input remains U/D/L/R.

Steal probability remains TBD.

------------------------------------------------------------------------

# 13. ARCHER

**Status:** Designed and added structurally in Prompt #5; actual attacks
remain largely deferred.\
**Prerequisite:** None.\
**Growth:** +1 DEX.\
**Class MOV:** 0.\
**Equipment:** bows, light armor.\
**Rule:** all Archer Action abilities require an eligible bow; Secondary
Action does not bypass this.

### Action

-   Lv1 Aimed Shot --- substantially increased accuracy; amount TBD.
-   Lv3 Power Shot --- increased damage, reduced accuracy; values TBD.
-   Lv5 Suppressing Shot --- on hit reduces target MOV until its next
    turn; amount TBD.
-   Lv7 Long Shot --- beyond normal max range; extension/penalty TBD.
-   Lv9 Piercing Shot --- ignores large portion of DEF; amount TBD.

### Reaction

-   Lv8 Covering Fire --- if enemy within legal equipped-bow range
    attacks **another friendly unit**, chance to bow-attack triggering
    enemy **before** triggering attack resolves.
    -   cannot trigger when Archer is target
    -   eligible bow required
    -   normal targeting restrictions
    -   no activation-frequency cap
    -   every qualifying attack can provide a chance
    -   if Archer prevents attacker from completing attack, pending
        attack does not resolve
    -   not a counterattack
    -   double-attack ineligible
    -   chance TBD

### Support

-   Lv4 Light Armor Training
-   Lv6 Eagle Eye --- bow accuracy bonus TBD
-   Lv7 Bow Training --- allows heavy bows
-   Lv9 Dexterity Training --- future DEX growth; bonus TBD

### Movement

-   Lv10 Firing Position --- unit can move up to 1 tile and then fire 1
    tile farther; intended to retreat slightly and gain safety/range;
    combines with Long Shot. Exact MOV cost/timing TBD. Do not assume
    free movement.

**Surefooted does NOT belong to Archer.** It is reserved for future
Ranger.

------------------------------------------------------------------------

# 14. RANGER --- FUTURE CONCEPT ONLY

Proposed advanced Fighter/Archer hybrid.

-   sword-based Fighter + Archer identity
-   intended to equip a **sword and heavy bow simultaneously**
-   Surefooted belongs here:
    -   additional terrain movement cost reduced by 1
    -   minimum normal cost 1
-   prerequisites TBD, likely Fighter + Archer levels but not finalized

Do not implement or invent a complete Ranger table yet.

------------------------------------------------------------------------

# 15. ALCHEMIST

**Status:** Design complete; Prompt #5 implemented data/hooks and some
executable policies.\
**Growth:** +1 WIS.\
**Prerequisite:** none currently.\
**Equipment:** light weapons/light armor **PROVISIONAL/TUNABLE**.

### Action

-   Lv1 Toss Item --- eligible consumable at range; thrown item
    consumed; Conservation cannot preserve it; range TBD.
-   Lv4 Forage --- produce item based on occupied tile; immediately use,
    throw, or store if space. Tiles may be repeatedly Foraged. Immediate
    use/throw bypasses Conservation. Stored item later behaves normally.
    Loot tables/action cost TBD.
-   Lv7 Refine --- combine two identical eligible consumables into one
    refined version whose total scalable numerical effect exceeds
    combined originals. Multiplier/output/action cost TBD.
-   Lv9 Panacea --- eligible curative item removes all removable
    negative statuses. Action cost TBD.

### Reaction

-   Lv3 Emergency Medicine --- after qualifying damage leaves unit
    **below 60% MAX HP**, activates **100%**.
    -   automatically uses strongest carried healing item whose **full
        modified healing amount does not exceed missing HP**
    -   no overheal
    -   Potent Remedies modifies candidate amount before selection
    -   ordinary consumption, so Conservation applies
    -   damage-event granularity TBD

### Support

-   Lv2 Purifying Medicine --- HP-restorative item may remove one random
    removable negative status; chance TBD.
-   Lv4 Conservation --- high chance eligible normally-used consumable
    is not consumed; chance TBD.
    -   not Toss Item
    -   not immediate Forage use
    -   not immediate Forage throw
-   Lv5 Quick Items --- ordinary Item does not consume/prevent ordinary
    Major Action.
    -   allows Item + Attack
    -   Item + Magic
    -   Item + Steal
    -   does NOT allow Attack + Magic, Attack + Steal, Magic + Steal,
        etc.
-   Lv6 Light Weapon Training
-   Lv8 Potent Remedies --- HP items ×2; MP items **125%, rounded up**.
-   Lv9 Catalyze --- extends temporary consumable effects; duration
    extension TBD. When eligible temporary stat-buff consumable is
    **actually consumed**, very small chance recipient permanently gains
    +1 to an affected stat; chance TBD. If multiple stats, select one
    affected stat. If Conservation preserves item, no permanent-stat
    roll.
-   Lv10 Deep Satchel --- inventory capacity +1.

### Movement

-   Lv10 Scrounger --- hidden-item discovery.
    -   if unit starts turn within 5 tiles of hidden item, notify player
    -   SCROUNGE within 5 tiles gives N/E/S/W/NE/SE/NW/SW direction
    -   SCROUNGE on hidden-item tile obtains item
    -   exact distance metric, tie handling, action/MOV cost,
        collection/full-inventory behavior TBD

------------------------------------------------------------------------

# 16. HIDDEN ITEMS / OCCUPATION SECRETS

Hidden items belong to BattleScenario/Quest/Event data, not class state.

Potential future use:

-   procedural hidden items
-   handcrafted/story-map unique items
-   powerful secrets appearing in liberation battles after Zeon occupies
    a kingdom/capital
-   examples could include throne rooms, mines, temples, ports

Scrounger is the discovery mechanism.

Opportunity disappearance/persistent claimed flags were discussed but
are not finalized.

------------------------------------------------------------------------

# 17. TRADE

Prompt #5 added Trade transaction foundations.

Intended UI:

1.  choose TRADE
2.  highlight eligible adjacent friendly units
3.  choose adjacent unit
4.  show both inventories
5.  choose a slot/item on active unit
6.  choose slot/item on adjacent unit
7.  swap contents

Empty slots are selectable.

-   item + item → swap
-   item + empty → give/transfer
-   empty + item → take/transfer
-   empty + empty → no transaction; Major Action preserved

Physical item IDs must be preserved.

Trade does not auto-equip items.

Current implementation uses **orthogonal tactical adjacency**.

**Successful Trade Major Action cost remains TBD.**

------------------------------------------------------------------------

# 18. MAGIC MENU / SPELL ARCHITECTURE

## FINALIZED structural requirement

There is **one consolidated MAGIC top-level command**, even if spells
are accessible from both Primary and Secondary Action classes.

Example:

Current Wizard + Secondary Mage → one MAGIC command, not two.

The MAGIC menu groups accessible learned class-owned spell Action
Abilities.

Grouping never destroys:

-   ability ID
-   owning class
-   Primary/Secondary source
-   CP attribution
-   required Class Level
-   learned state
-   requirements

Likewise STEAL is a grouping of Thief Action Abilities, not a universal
action.

## Spell-family organization

Current structural direction:

MAGIC\
→ Blaze\
→ Lv1 / Lv2 / Lv3 / Lv4

and similarly Freeze, Bolt, Gale, etc.

Lower spell levels remain individually learned and selectable.

Metadata foundation exists for:

-   spell family
-   family name
-   spell level
-   optional prerequisite abilities

------------------------------------------------------------------------

# 19. WIZARD SPELL-MODIFIER DIRECTION

Wizard should **not** simply be "Mage but with higher spell levels."

Current identity direction:

-   **Mage** learns the fundamental elemental repertoire.
-   **Wizard** masters/manipulates how known spells are cast.
-   **Elementalist** specializes in unusual elemental targeting
    geometry/patterns.

Possible Wizard modifier concepts discussed:

-   Expand Spell
-   Focus Spell
-   Overcast

These are proposals, not finalized abilities/effects.

Desired UI direction:

MAGIC\
→ Blaze\
→ Lv3\
→ Casting Method\
- Normal\
- Expand\
- Focus\
- Overcast\
→ Target

If no modifiers apply, skip the Casting Method submenu.

Current direction is at most **one modifier per cast**, but this has not
been explicitly finalized by the user.

Do not generate duplicate spell entries such as "Expanded Blaze 3."

Prompt #5 implemented generic casting-option structure only; no Wizard
arithmetic or class table.

------------------------------------------------------------------------

# 20. MAGE --- CURRENT DESIGN AFTER PROMPT #5

**IMPORTANT:** Mage was designed after Prompt #5 completed and is **NOT
YET IMPLEMENTED** in the prototype.

## Header

-   **Role:** foundational offensive elemental spellcaster
-   **Prerequisite:** none
-   **Growth:** **+1 INT**
-   **Equipment:** **Wands, Robes**
-   **Initial training:** **100 Current Mage CP, 0 Lifetime CP**, once
    per character, sufficient to purchase one Lv1 elemental spell
-   Class MOV currently treated as neutral/0 in the design workbook, but
    avoid elevating unspecified MOV fallbacks into a universal final
    rule without confirmation.

## Elemental spell families

-   **Blaze** --- fire
-   **Freeze** --- ice
-   **Bolt** --- lightning
-   **Gale** --- air/wind

Each spell level is an individual purchasable Action Ability.

### Unlock schedule

Mage Lv1: - Blaze 1 - Freeze 1 - Bolt 1 - Gale 1

Mage Lv3: - Blaze 2 - Freeze 2 - Bolt 2 - Gale 2

Mage Lv5: - Blaze 3 - Freeze 3 - Bolt 3 - Gale 3

Mage Lv7: - Blaze 4 - Freeze 4 - Bolt 4 - Gale 4

With the finalized CP price curve, those tiers cost 100 / 150 / 200 /
250 each.

All sixteen elemental spells cost **2800 CP total** before other Mage
abilities, creating intended specialization pressure during normal
progression while allowing eventual mastery through post-Lv10 grinding.

### Higher-level spell prerequisite

Requiring Blaze 1 before Blaze 2, etc. was proposed and is supported
structurally by Prompt #5, but **the user has not explicitly finalized
this requirement**. Treat as TBD until confirmed.

## Current Mage table

  ------------------------------------------------------------------------------------------------------------------------------------
  Category   Lv1      Lv2           Lv3      Lv4           Lv5      Lv6                Lv7      Lv8              Lv9    Lv10
  ---------- -------- ------------- -------- ------------- -------- ------------------ -------- ---------------- ------ --------------
  Action     Blaze 1; ---           Blaze 2; ---           Blaze 3; ---                Blaze 4; ---              ---    ---
             Freeze                 Freeze                 Freeze                      Freeze                           
             1; Bolt                2; Bolt                3; Bolt                     4; Bolt                          
             1; Gale                2; Gale                3; Gale                     4; Gale                          
             1                      2                      3                           4                                

  Reaction   ---      ---           ---      ---           ---      **Arcane           ---      ---              ---    ---
                                                                    Seething** ---                                      
                                                                    when damaged by an                                  
                                                                    enemy, the next                                     
                                                                    applicable spell                                    
                                                                    cast is **10%                                       
                                                                    stronger**.                                         
                                                                    Offensive damage                                    
                                                                    +10%; HP                                            
                                                                    restoration +10%;                                   
                                                                    numerical                                           
                                                                    stat-buff                                           
                                                                    magnitude +10%;                                     
                                                                    other applicable                                    
                                                                    scalable spell                                      
                                                                    effects follow the                                  
                                                                    same principle.                                     
                                                                    Consumed by the                                     
                                                                    next applicable                                     
                                                                    spell cast.                                         
                                                                    Rounding/general                                    
                                                                    edge cases TBD.                                     

  Support    ---      **Robe        ---      **Wand        ---      ---                ---      **Intelligence   ---    **Arcane
                      Training**             Training**                                         Training** ---          Efficiency**
                      ---                    ---                                                improves future         --- reduces
                      cross-class            cross-class                                        INT growth while        spell MP costs
                      permission to          permission to                                      equipped; exact         by **10%**;
                      equip robes.           equip wands.                                       additional              MP-cost
                                                                                                growth TBD.             rounding TBD.

  Movement   ---      ---           ---      ---           ---      ---                ---      ---              ---    ---
  ------------------------------------------------------------------------------------------------------------------------------------

### Naming / reservation notes

**Arcane Seething** is the accepted name for the Lv6 Mage Reaction.

A separate reaction concept --- **chance to counterattack with a Lv1
spell** --- should NOT be placed on Mage. The user wants that reserved
for an **early Wizard level**.

Elemental Affinity / Elemental Mastery were considered and then removed
from Mage because they sound more appropriate for **Elementalist**. Do
not resurrect them as Mage abilities.

Mage Lv9 remains intentionally open. Do not fill it merely to make the
table look complete.

Exact spell mechanics remain TBD:

-   MP costs
-   damage formulas
-   range
-   AoE
-   elemental interactions
-   rounding
-   Wand basic-attack formula

------------------------------------------------------------------------

# 21. OTHER MAGIC-CLASS CONCEPTS

## Cleric

Basic healing spellcaster. Current conceptual growth +1 WIS. Originally
envisioned access to basic healing levels. Detailed table not yet
designed.

## Hexer

Status/debuff spellcaster. Conceptual prerequisite: some Mage + Cleric
mastery. Conceptual growth +2 WIS/+1 CON. Exact prerequisite/table TBD.

## Enchanter

Buff/enhancement caster. Possibly Pixie-only. Conceptual growth +2
INT/+1 AGI. Race lock and table TBD.

## Wizard

Advanced spellcasting mastery/manipulation rather than merely higher
elemental spell levels. Conceptual growth +2 INT. Requires several Mage
levels, exact prerequisite TBD.

Reserve an early Wizard Reaction for: **chance to counterattack with a
Lv1 spell.** Exact chance/selection/MP behavior TBD.

Unique Wizard spell idea previously mentioned: **Desoul**, small
instant-death chance. Not yet finalized into a table.

## Unnamed Advanced Healer

Healing levels 1--4 concept; requires several Cleric levels; conceptual
+2 WIS. Name/table TBD.

## Elementalist

High-level elemental specialist with unusual AoE/target geometry.
Conceptual +3 INT. Requires high Mage + Wizard mastery; exact levels
TBD.

Examples discussed, not finalized: - manually chained lightning - fire
line/cone - ice cross/wall/path - air directional corridor

Elemental Affinity / Elemental Mastery names/concepts may fit here
better than Mage.

## Summoner

Summons monsters onto battlefield. Race/prerequisite concepts
unresolved. "Medium MP growth" must be reconciled with derived MP
architecture.

## Paladin

Advanced martial/divine class with basic healing magic. **FINALIZED
prerequisite from earlier design:** Knight Lv5 + Cleric Lv5. Conceptual
growth: +3 STR/+2 CON/+1 WIS. Full table not designed.

## Druid

Reintroduced as a **maybe** concept. Do not treat old "no Druid"
decision as categorical anymore. Still TBD.

## Time spellcaster

Maybe concept. Name/mechanics TBD.

------------------------------------------------------------------------

# 22. CLASS TABLE FORMAT

When presenting future class designs, use this exact general structure:

Header information above the table: - role/identity - prerequisite -
class growth - equipment - class MOV if established - other class-wide
rules

Then table columns:

**Category \| Lv1 \| Lv2 \| Lv3 \| Lv4 \| Lv5 \| Lv6 \| Lv7 \| Lv8 \|
Lv9 \| Lv10**

Rows:

-   **Action**
-   **Reaction**
-   **Support**
-   **Movement**

Each populated cell should include the **ability name plus a concise
mechanical description**, not just the name.

Do not force every level/category to contain an ability.

------------------------------------------------------------------------

# 23. CURRENT SPREADSHEET

Latest class-design workbook created in this chat:

**Shining_Farce_Class_Design_v4_with_Mage.xlsx**

It includes a Mage sheet and Mage in Comparisons.

Caution: spreadsheets can contain historical/assistant-authored wording.
Explicit conversation decisions and latest implementation reports are
more authoritative when conflicts appear.

Known warning: older workbook/code material may contain Thief Lv3
**Evade**, which should not automatically be treated as authoritative.

------------------------------------------------------------------------

# 24. IMPORTANT SUPERSEDED / DO-NOT-RESURRECT ITEMS

-   Do not give **every class** 100 starting Current CP. Only classes
    explicitly needing it should receive a grant.
-   Do not treat **Steal** as a universal Major Action for CP
    attribution. It is a Thief-owned Action Ability grouping.
-   Do not implement **10 CP per action** as though finalized. It was
    only discussed.
-   Do not make Wizard simply learn Mage's Lv3/Lv4 elemental spells as
    "Mage but stronger." Mage now learns all four levels of all four
    core elemental families.
-   Do not put **Elemental Affinity** or **Elemental Mastery** on Mage;
    they were removed.
-   Do not put the Lv1-spell counterattack reaction on Mage; reserve it
    for early Wizard.
-   Do not put **Surefooted** on Archer; reserve it for Ranger.
-   Do not assume Firing Position movement is free.
-   Do not assume Conservation is 50%; chance remains TBD.
-   Do not assume Catalyze is 0.1--0.5%; chance remains TBD.
-   Do not assume higher spell levels require previous levels until the
    user explicitly confirms it.
-   Do not infer a final successful Trade Major Action cost.
-   Do not invent Wand attack scaling.
-   Do not treat metadata/hooks as fully implemented tactical combat.

------------------------------------------------------------------------

# 25. MAJOR OPEN DESIGN QUESTIONS

Near-term:

1.  Finish Mage, especially whether Lv9 receives an ability.
2.  Confirm whether higher spell levels require the preceding level in
    the same family.
3.  Design exact Mage spell mechanics:
    -   MP costs
    -   damage
    -   ranges
    -   AoEs
    -   elemental distinctions
4.  Design Cleric.
5.  Design Wizard enough to define spell-modifier rules and its early
    Lv1-spell counterattack Reaction.
6.  Decide actual CP award formula/amount per executed action.
7.  Determine whether success/failure modifies CP award.
8.  Resolve Growth Training bonuses.
9.  Add/define actual bow equipment and equipment weight tiers.
10. Determine Wand/Robe catalog entries and Wand basic-attack behavior.

Other unresolved systems:

-   physical damage/hit/dodge formulas
-   magic/healing formulas
-   status/debuff resistance
-   turn order
-   universal counterattack chance
-   double-attack AGI formula
-   Steal probability
-   Flurry modifier
-   Fighter/Knight/Thief unresolved numerical effects
-   Archer numerical effects
-   Alchemist unresolved probabilities/tables/costs
-   Trade successful action cost
-   Scrounger distance/ties/cost/collection/full-inventory behavior
-   full combat/reaction scheduler
-   spell casting execution
-   AI
-   BattleResult integration for detached tactical mutations

------------------------------------------------------------------------

# 26. RECOMMENDED NEXT-CHAT BEHAVIOR

The next chat should begin by treating this handoff and the latest Codex
implementation report as authoritative state, not by reconstructing the
project from generic RPG assumptions.

For brainstorming, conversational reasoning is fine.

Before generating a consequential Codex prompt:

1.  inspect the latest implementation report(s);
2.  compare requested changes against what is already implemented;
3.  preserve all existing passing work unless a newer design explicitly
    supersedes it;
4.  list unresolved values rather than filling them;
5.  explicitly separate implementation of generic architecture from
    incomplete combat behavior;
6.  avoid resurrecting superseded proposals.

The user is intentionally developing the game iteratively and prefers
precise architecture over premature implementation of formulas that have
not been designed.
