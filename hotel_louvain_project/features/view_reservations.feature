Feature: Consultation des réservations
  En tant qu'utilisateur connecté
  Je veux consulter mes réservations
  Afin de voir les dates et chambres que j'ai réservées.

  Scenario: L'utilisateur consulte ses réservations
    Etant donné que l'utilisateur est connecté
    Quand il se rend sur la page "Mes réservations"
    Alors la liste de ses réservations doit s'afficher
    Et chaque réservation doit afficher la chambre, la date d'arrivée et de départ.

  Scenario: L'utilisateur non connecté tente de consulter ses réservations
    Etant donné que l'utilisateur n'est pas connecté
    Quand il tente d'accéder à "Mes réservations"
    Alors il doit être redirigé vers la page "Connexion".
