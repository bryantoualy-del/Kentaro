# Importer une session Kentaro dans Obsidian sur iPad

Le compagnon Kentaro utilise désormais le plugin **Kentaro Session Importer**. Aucun raccourci Apple n’est nécessaire.

## Installation unique

1. Dans Obsidian, ouvre **Réglages → Modules complémentaires communautaires**.
2. Installe et active **BRAT**.
3. Ouvre les réglages de BRAT puis choisis **Add beta plugin**.
4. Saisis : `bryantoualy-del/Kentaro`.
5. Sélectionne la dernière version disponible.
6. Active ensuite **Kentaro Session Importer** dans les modules installés.

## À la fin d’une session

1. Dans l’onglet Journal du compagnon, touche **1 · Télécharger**.
2. Touche **2 · Ouvrir Obsidian**.
3. Dans Obsidian, touche l’icône lune ou lance la commande **Importer une session Kentaro**.
4. Sélectionne le ZIP Kentaro dans Téléchargements.
5. Vérifie l’aperçu puis touche **Importer dans ce coffre**.

Le plugin crée automatiquement les dossiers nécessaires, classe les fichiers puis ouvre la note de session.

## Protection des données

- une fiche PNJ existante n’est jamais écrasée ;
- une session portant déjà le même nom est importée comme copie ;
- un portrait n’est actualisé que si l’export est plus récent ;
- chaque import conserve un reçu dans `98 - Archives/Imports Kentaro` ;
- tout le traitement reste local sur l’appareil.

## Mise à jour des fiches PNJ

Dans le carnet Kentaro, une note de type **PNJ** reste une simple mention par défaut. Si le personnage devient important, touche le bouton **♙** de la mention ou **Créer une fiche PNJ**. Seules ces fiches explicites sont envoyées dans le registre Obsidian.

Pendant l’import, le plugin affiche chaque information avec une case à cocher. Il ajoute uniquement les éléments sélectionnés dans une zone **Suivi automatique Kentaro** de la fiche existante. Le reste de la fiche reste intact et les changements de statut sont décochés par défaut.

Si une ancienne mention devient importante après la séance, sélectionne son passage dans la note Obsidian puis lance **Créer un PNJ depuis la sélection** dans la palette de commandes. La nouvelle fiche conserve automatiquement un lien vers la session source.
