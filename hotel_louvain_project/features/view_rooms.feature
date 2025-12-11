Feature: Consultation des chambres
  En tant qu'utilisateur
  Je veux voir la liste des chambres disponibles
  Afin de choisir celle que je veux réserver.

  Scenario: L'utilisateur consulte la liste des chambres
    Etant donné que l'utilisateur se rend sur la page "Chambres"
    Quand la page se charge
    Alors une liste de chambres disponibles doit s'afficher
    Et chaque chambre doit afficher son nom, type, capacité et prix.

  Scenario: L'utilisateur filtre les chambres par type
    Etant donné que l'utilisateur est sur la page "Chambres"
    Quand il sélectionne "Suite" dans le filtre
    Alors seules les chambres de type "Suite" doivent être affichées.
