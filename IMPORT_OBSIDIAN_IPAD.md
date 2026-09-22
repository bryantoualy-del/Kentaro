# Import automatique Kentaro vers Obsidian sur iPad

Le compagnon produit désormais un ZIP routable contenant :

- `_kentaro-import.json` : manifeste lisible par une automatisation ;
- `Contenu/01 - Sessions` : note de séance ;
- `Contenu/02 - Personnages/PNJ` : nouvelles fiches PNJ autorisées ;
- `Contenu/99 - Médias` : portraits liés ;
- `Contenu/98 - Archives/Imports Kentaro` : reçu d’import.

Le bouton **Partager vers Obsidian** ouvre directement la feuille de partage d’iPadOS lorsque le navigateur accepte le partage de fichiers. Sinon, le ZIP est téléchargé normalement.

## Raccourci à créer une seule fois

Créer dans l’application Raccourcis un raccourci nommé **Importer session Kentaro** :

1. Dans les détails, activer **Afficher dans la feuille de partage**.
2. Toucher le type d’entrée affiché en bleu et ne conserver que **Fichiers**. Ne pas laisser `Apps et 18 de plus`, du texte, des URL ou d’autres types.
3. Ajouter **Extraire l’archive** en utilisant l’entrée du raccourci.
4. Vérifier que le dossier extrait contient `_kentaro-import.json`. Si ce fichier manque, arrêter avec le message `Ce ZIP n’est pas un export Kentaro compatible`.
5. Pour chacun des quatre dossiers sous `Contenu`, récupérer son contenu et enregistrer ses fichiers dans le dossier homonyme du coffre Obsidian `DND` :
   - `01 - Sessions` vers `DND/01 - Sessions` ;
   - `02 - Personnages/PNJ` vers `DND/02 - Personnages/PNJ` ;
   - `99 - Médias` vers `DND/99 - Médias` ;
   - `98 - Archives/Imports Kentaro` vers `DND/98 - Archives/Imports Kentaro`.
6. Appliquer les règles de conflit suivantes :
   - session existante : demander `Mettre à jour`, `Garder les deux` ou `Annuler` ;
   - fiche PNJ existante : ignorer la nouvelle fiche ;
   - média Kentaro existant : remplacer ;
   - reçu d’import : conserver, son nom horodaté est unique.
7. Afficher la notification **Session Kentaro importée**.
8. Facultatif : ouvrir l’URL `obsidian://open?vault=DND`.

Le choix des dossiers par Raccourcis déclenchera une demande d’autorisation la première fois. Il ne faudra ensuite plus refaire cette configuration.

## Utilisation après installation

1. Dans Kentaro, ouvrir **Journal > Carnet de session**.
2. Toucher **Partager vers Obsidian**.
3. Choisir **Importer session Kentaro** dans la feuille de partage.
4. Attendre la notification de fin puis ouvrir Obsidian.

Le bouton **Télécharger ZIP** reste disponible pour sauvegarder ou importer manuellement le paquet.
