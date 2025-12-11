Feature: Réservation d'une chambre
  En tant qu'utilisateur connecté
  Je veux réserver une chambre
  Afin de séjourner à l'hôtel.

  Scenario: L'utilisateur réserve une chambre avec des dates valides
    Etant donné que l'utilisateur est connecté
    Et qu'il se trouve sur la page d'une chambre
    Quand il choisit une date d'arrivée, une date de départ et le nombre d'invités
    Et qu'il valide la réservation
    Alors la réservation doit être enregistrée
    Et une page de confirmation doit s'afficher.

  Scenario: L'utilisateur tente de réserver sans être connecté
    Etant donné que l'utilisateur n'est pas connecté
    Quand il clique sur "Réserver"
    Alors il doit être redirigé vers la page "Connexion".
