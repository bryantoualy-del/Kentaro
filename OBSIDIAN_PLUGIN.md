# Kentaro Session Importer

Plugin Obsidian mobile et ordinateur pour importer les paquets ZIP produits par le compagnon Kentaro.

## Installation avec BRAT

1. Installer **BRAT** depuis les modules complémentaires communautaires d’Obsidian.
2. Dans BRAT, choisir **Add beta plugin**.
3. Ajouter `bryantoualy-del/Kentaro` et sélectionner la dernière version.
4. Activer **Kentaro Session Importer** dans les modules installés.

## Utilisation

1. Dans le compagnon Kentaro, télécharger le paquet Obsidian.
2. Dans Obsidian, toucher l’icône en forme de lune ou lancer la commande **Importer une session Kentaro**.
3. Choisir le ZIP dans Téléchargements.
4. Vérifier l’aperçu et confirmer l’import.

Le plugin crée les dossiers nécessaires et applique les règles suivantes :

- une session existante est conservée et la nouvelle devient une copie ;
- une fiche PNJ existante n’est jamais écrasée ;
- un portrait n’est remplacé que si l’export est plus récent ;
- les reçus d’import sont toujours renommés en cas de doublon.

Lorsqu’une fiche PNJ existe déjà, l’aperçu permet de choisir les informations de la session à ajouter. Le plugin écrit uniquement dans une section balisée `Suivi automatique Kentaro` et ne modifie jamais le reste de la fiche. Les changements de statut sont décochés par défaut.

## Faire évoluer une simple mention

Dans une note de session, sélectionne le passage consacré à un PNJ devenu important, puis lance la commande **Créer un PNJ depuis la sélection**. Renseigne son nom, sa relation et son statut : le plugin crée sa fiche dans `02 - Personnages/PNJ` et conserve un lien vers la session source.

Le compagnon n’est pas un second registre permanent : seules les fiches explicitement créées pendant la session sont exportées. Les autres personnages restent de simples mentions dans la chronologie.

Le traitement est entièrement local.
