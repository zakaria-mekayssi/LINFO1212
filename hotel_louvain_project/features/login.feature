Feature: Connexion utilisateur
  En tant qu'utilisateur inscrit
  Je veux pouvoir me connecter
  Afin d'accéder à mes réservations et réserver une chambre.

  Scenario: L'utilisateur se connecte avec des identifiants valides
    Etant donné que l'utilisateur est sur la page "Connexion"
    Quand il saisit un email et un mot de passe corrects
    Alors il doit être connecté
    Et être redirigé vers la page d'accueil.

  Scenario: L'utilisateur saisit un mot de passe incorrect
    Etant donné que l'utilisateur est sur la page "Connexion"
    Quand il saisit un mauvais mot de passe
    Alors un message "Email ou mot de passe incorrect." doit apparaître.

  Scenario: L'utilisateur non connecté tente d'accéder à "Mes réservations"
    Etant donné que l'utilisateur n'est pas connecté
    Quand il tente d'accéder à la page "Mes réservations"
    Alors il doit être redirigé vers la page "Connexion".
