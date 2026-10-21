# Crucible army orders

Open Crystal shop → Army at your living crystal, or while recalling through it. Orders cost no mana. They cannot be changed from the field or after your crystal is destroyed. The current order also appears in the match status line.

- **Automatic:** retain the existing stable siege assignment and road routing.
- **Siege selected base:** focus one guardian at a time, then its crystal. Roads and any intervening enemy base still matter; an explicit distant order does not permit walking through fields or ignoring a base along the route.
- **Hunt selected champion:** choose a living champion currently seen by the army or scouted within twelve seconds. Troops follow roads toward sightings, engage the designated visible champion within attack range, and search the last observed position after sight is lost. No unseen live coordinates are used. After twelve seconds without sight, or when the target dies or is eliminated, return to Automatic.
- **Rally and defend:** all ordinary troops and the purchased siege beast return on foot, gather around the home platform and attack nearby intruders. Living champion protection takes priority when its attacker is in troop range. Native summoned/converted servants keep their own kit behavior.
- **Release the horde:** leave Rally mode for the selected base, or Automatic if no surviving base is selected. New troops obey the standing order too.

Recall is a valid command window. It lets a defeated champion request meat shields, surrender lane presence to deny farm, or prepare a coordinated push. Troops do not teleport or receive additional health/damage for defending. Existing troop pools and living caps still apply, so a full army stalls its own replacement spawns; it never consumes another crystal's reinforcement slots. Recall siege bonuses apply only to troops actually assigned siege/automatic orders, not unrelated defenders or hunters.

NPCs use the same location and recall restrictions. At home or during recall they can rally against a visible threat to their crystal, release defenders once they return and the immediate danger passes, or hunt a recently seen champion without a crystal. They cannot issue perfect remote orders from anywhere or acquire hidden targets. Losing a crystal cancels standing commands; surviving minions revert to the existing champion escort behavior.

Rendering and movement reuse existing generated assets and the authored road graph. Paths are cached and refreshed for moving hunt sightings rather than recalculated each frame. The UI is shared by the live Stage 4 page, exhibition and isolated Crucible prototype. v52 scores remain separate from earlier best-score rules; historical v49–v51 codes still verify.
