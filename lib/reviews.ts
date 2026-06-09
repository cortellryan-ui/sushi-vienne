/**
 * Avis clients Google affichés sur l'accueil.
 *
 * VRAIS avis Google du restaurant Sushi Smile (Vienne), retranscrits depuis
 * les captures fournies par le client. Sélection des avis 4–5★ pour la section
 * vitrine. Textes parfois raccourcis pour la lisibilité du carrousel.
 */

export type Review = {
  name: string;
  text: string;
  rating: number; // 1 à 5
  role?: string; // ex. "Avis Google", date, "Local Guide"…
};

/** Note globale et volume d'avis affichés dans l'en-tête. À confirmer avec la fiche Google. */
export const googleMeta = {
  rating: 4.6,
  count: 200,
} as const;

export const reviews: Review[] = [
  {
    name: "Shaina",
    text: "Très bons sushis, je recommande, meilleure adresse. C'est la première fois que je goûte et c'est excellent !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Lina Benmaouche",
    text: "Excellente expérience ! Les sushis sont frais, bien préparés et très savoureux. Le riz est parfaitement assaisonné et la découpe du poisson est impeccable.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Dina Benaissa",
    text: "Avant je n'aimais pas les sushis mais Sushi Smile m'a fait aimer. Je recommande à 100% et personnel au top !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Elyssa Benaissa",
    text: "J'ai découvert ce restaurant grâce à une amie, et je ne regrette vraiment pas d'y être allée : la nourriture est excellente et de qualité, le service top et rapide.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Maria Pinston",
    text: "Un vrai régal. Je recommande à 100000%. La gentillesse de la vendeuse fait du bien ❤️ Meilleur Californien, la qualité au top.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Yoann Fernandez",
    text: "Très bon restaurant de sushi à Vienne. La carte est très variée, les menus sont bien garnis en fonction des goûts et des envies.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Kadri Ilyes",
    text: "Un grand merci à ce restaurant pour une expérience sushi exceptionnelle ! Des saveurs raffinées, une qualité irréprochable et un service impeccable.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Dragon Fly",
    text: "Les sushis sont bien copieux, les brochettes parfaitement cuites et la salade de chou très bien assaisonnée. Je recommande vivement.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Eleyna B",
    text: "Meilleurs sushis de Vienne et super service !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Naima Chaoui",
    text: "Commande d'un menu Two. Les prix sont très corrects pour la qualité. Amateurs de sushis ? Foncez. Les produits sont frais.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Imrane Abdoul",
    text: "Rarement vu des sushis aussi bons, l'accueil est convivial, je peux venir en famille et parfois entre amis. Meilleur sushi de Vienne franchement.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Laura Martins",
    text: "Amateuse de sushis, j'ai testé ce restaurant pour la première fois hier soir et ils étaient vraiment bons ! Je recommande.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Loane Toutain",
    text: "Très bon restaurant de sushi sur Vienne. La carte est variée, les menus bien garnis à des prix abordables. Nous avons été très bien accueillis.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Laura Czls",
    text: "Toujours aussi bon ! Les meilleurs sushis que j'ai jamais mangés de toute ma vie ! Ils sont super gentils ! Je recommande.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Nina T",
    text: "Très bon lieu avec de bons produits et un large choix, personnel très accueillant et agréable.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Emilie Sarreaud",
    text: "J'aime beaucoup me faire une pause sushis avec eux, ils ont toujours de très bons produits.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Khalis Dehbi",
    text: "De passage à Vienne, je me suis laissé tenter par un sushi. J'ai découvert un personnel incroyable par son accueil. Les sushis sont bons.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Khedidja Kasraoui",
    text: "Très bonne adresse. Je recommande +++. Le personnel est top. Nous avons été très bien accueillis par le patron. Mention spéciale pour les nems et les nouilles.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Chris Bressey",
    text: "Vraiment LE endroit pour quand on a envie de sushi et ses consorts. Bien préparé, l'accueil est très sympa et les prix très corrects. Je recommande.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Dumenil Julien",
    text: "Asiatique en emporté et en livraison. Je commande très souvent en livraison, les produits sont frais et bons.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Mylène Maros",
    text: "Je recommande ce lieu à tout le monde. L'équipe est aux petits soins.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Dahlia",
    text: "Une très agréable découverte, grâce à eux je me suis réconciliée avec le sushi ! Personnel souriant et accueillant. Goûtez aussi les nouilles aux crevettes. Je reviendrai.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Valentine Molinari",
    text: "Très bonne adresse, personnel vraiment au top. J'ai eu un souci avec ma commande et ils m'ont rapidement trouvé une solution. Un grand merci, je recommande vraiment.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Fanny Euksuzian",
    text: "J'adore la qualité et la prestation ! Patron cuistot, serveuse livreuse au top... Gentils, agréables, serviables.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Monsieur Patate",
    text: "Client régulier, je retourne dans ce restaurant dès que j'en ai l'occasion. Personnel toujours très sympathique, produits bons et prix plus que corrects. Je recommande !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Emilie François",
    text: "Les sushis sont bien présentés et le goût est là. Une première chez Sushi Smile, et sûrement pas la dernière.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "AntoC69",
    text: "Personnel très sympathique et tout était très bon. Nouilles très bonnes, bien assaisonnées, sushis au top. Merci !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Inès Abdelli",
    text: "Excellent, je recommande à 100%. Serveurs au top avec une très belle salle chaleureuse et familiale. Je reviendrai sans hésiter.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Manon Tzy",
    text: "Nous avions pris le menu Two, assez copieux pour 2 personnes, les sushis étaient très bons et de qualité. Je recommande fortement !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Gwendoline Ignarra",
    text: "De très bons plats ! Jamais déçue comparé à d'autres sushis du coin !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Adeline",
    text: "Accueil agréable, très gentille, à l'écoute des clients. Meilleur sushi que j'ai pu manger sur Vienne et alentours. Tout est très bon. Je les recommande.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Elya",
    text: "Ambiance très agréable, les sushis sont délicieux et vraiment qualitatifs pour ce prix ! Foncez.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "H D",
    text: "Porte super bien son nom : accueil souriant et chaleureux, lieu propre et beaucoup de choix, rapport qualité-prix 👌 Délicieux, je recommande.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Maïssa Demircan",
    text: "Personnel très sympathique, c'était très bon et j'ai surtout beaucoup aimé les nems 😍 Merci beaucoup.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Alexis Mikaelian",
    text: "Après plusieurs passages par Vienne ! Je recommande fortement ! Efficace et très bon ! Sushi comme les woks !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Florence Maffini",
    text: "Toujours aussi top ! Service chaleureux, les meilleurs sushis de Vienne !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Syrine Ghali",
    text: "Je n'aimais pas les sushis mais le propriétaire m'a fait aimer, agréable et chaleureux, je reviendrai avec plaisir.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Filip Ostalczyk",
    text: "Riz consistant, poisson frais et ferme, et surtout des quantités vraiment suffisantes pour de grands appétits !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Line Bouquin",
    text: "Vient juste d'y passer, très bon accueil, super bonne salade de choux et vraiment pas voleur sur les prix. Je recommande, merci beaucoup 👍",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Ines Grine",
    text: "Super accueil, personnel très convivial, sushis excellents, je recommande !!!",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Jade L",
    text: "Personnel très sympathique, sushis excellents, je me suis déplacée de Lyon, je recommande les yeux fermés, à très bientôt !!!",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Anis Samy",
    text: "2 ans que je commande régulièrement ici, qualité, service et amabilité top ! Je recommande vivement.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Séverine",
    text: "Très bons sushis, rapport qualité-prix au top, personnel sympa. Je recommande.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Driss SixNeuf",
    text: "Super accueil, on mange super bien. C'est un 10/10 et on reviendra !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Frédéric Box",
    text: "Le Sushi Smile porte bien son nom : sourire et bonne humeur. Le choix est vraiment varié.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Marine",
    text: "Commande livrée via Uber Eats, réalisée rapidement. Très bien !",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Marylin",
    text: "Très accueillant, toujours avec le sourire, le patron ainsi que les employés sont très professionnels et la cuisine est très bonne.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Hind Genin",
    text: "De très bons sushis bien frais. Personnel au top.",
    rating: 5,
    role: "Avis Google",
  },
  {
    name: "Marion Giroudon",
    text: "Très bon, des plats originaux (par exemple les makis saumon cuit et gingembre).",
    rating: 4,
    role: "Avis Google",
  },
];
