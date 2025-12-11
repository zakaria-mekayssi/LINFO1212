Feature: Inscription utilisateur
  En tant que nouvel utilisateur
  Je veux créer un compte
  Afin de pouvoir me connecter et réserver des chambres.

  Scenario: L'utilisateur s'inscrit avec des informations valides
    Etant donné que l'utilisateur est sur la page "Inscription"
    Quand il remplit le formulaire avec un email valide, un nom et un mot de passe
    Et qu'il valide le formulaire
    Alors un nouveau compte doit être créé
    Et l'utilisateur doit être redirigé vers la page d'accueil connecté.

  Scenario: L'utilisateur tente de s'inscrire avec un email déjà utilisé
    Etant donné qu'un compte existe déjà avec l'email "test@example.com"
    Quand l'utilisateur remplit le formulaire d'inscription avec le même email
    Alors un message "Un compte existe déjà avec cet email" doit s'afficher.

  Scenario: L'utilisateur tente de s'inscrire avec deux mots de passe différents
    Etant donné que l'utilisateur est sur la page "Inscription"
    Quand il saisit deux mots de passe différents
    Alors un message "Les mots de passe ne correspondent pas" doit apparaître.
