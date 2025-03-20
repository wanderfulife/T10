export const questions = [
	{
		id: "Poste",
		text: "Station de montée",
		options: [
			{ id: 1, text: "Jardin Parisien", next: "Q1_descente" },
			{ id: 2, text: "Hôpital Béclère", next: "Q1_descente" },
			{ id: 3, text: "Le Hameau", next: "Q1_descente" },
			{ id: 4, text: "Parc des Sports", next: "Q1_descente" },
			{ id: 5, text: "Noveos", next: "Q1_descente" },
			{ id: 6, text: "Malabry", next: "Q1_descente" },
			{ id: 7, text: "Vallée aux Loups", next: "Q1_descente" },
			{ id: 8, text: "Cité Jardin", next: "Q1_descente" },
			{ id: 9, text: "Les Peintres", next: "Q1_descente" },
			{ id: 10, text: "Théâtre La Piscine", next: "Q1_descente" },
			{ id: 11, text: "Petit Châtenay", next: "Q1_descente" },
			{ id: 12, text: "LaVallée", next: "Q1_descente" },
			{ id: 13, text: "La Croix de Berny", next: "Q1_descente" }
		]
	},
	{
		id: "Q1_descente",
		text: "Station de descente",
		options: [
			{ id: 1, text: "Jardin Parisien", next: "Q2" },
			{ id: 2, text: "Hôpital Béclère", next: "Q2" },
			{ id: 3, text: "Le Hameau", next: "Q2" },
			{ id: 4, text: "Parc des Sports", next: "Q2" },
			{ id: 5, text: "Noveos", next: "Q2" },
			{ id: 6, text: "Malabry", next: "Q2" },
			{ id: 7, text: "Vallée aux Loups", next: "Q2" },
			{ id: 8, text: "Cité Jardin", next: "Q2" },
			{ id: 9, text: "Les Peintres", next: "Q2" },
			{ id: 10, text: "Théâtre La Piscine", next: "Q2" },
			{ id: 11, text: "Petit Châtenay", next: "Q2" },
			{ id: 12, text: "LaVallée", next: "Q2" },
			{ id: 13, text: "La Croix de Berny", next: "Q2" }
		]
	},
	{
		id: "Q2",
		text: "Sens",
		options: [
			{ id: 1, text: "La Croix de Berny", next: "Q3" },
			{ id: 2, text: "Vers Jardin Parisien", next: "Q3" }
		]
	},
	{
		id: "Q3",
		text: "D'où êtes-vous parti ?",
		options: [
			{ id: 1, text: "Domicile", next: "Q4" },
			{ id: 2, text: "Travail habituel", next: "Q4" },
			{ id: 3, text: "Affaires professionnelles", next: "Q4" },
			{ id: 4, text: "Ecole, Lycée, Université", next: "Q4" },
			{ id: 5, text: "Démarches admin., médicales", next: "Q4" },
			{ id: 6, text: "Autres affaires personnelles", next: "Q4" },
			{ id: 7, text: "Loisirs", next: "Q4" },
			{ id: 8, text: "Achats", next: "Q4" },
			{ id: 9, text: "Restauration", next: "Q4" },
			{ id: 10, text: "Accompagnement", next: "Q4" },
			{ id: 11, text: "Autre", next: "Q4" },
			{ id: 12, text: "Sans réponse", next: "Q4" }
		]
	},
	{
		id: "Q4",
		text: "Préciser la ville",
		options: [
			{ id: 1, text: "Clamart", next: "Q5" },
			{ id: 2, text: "Le Plessis-Robinson", next: "Q5" },
			{ id: 3, text: "Châtenay Malabry", next: "Q5" },
			{ id: 4, text: "Antony", next: "Q5" },
			{ id: 5, text: "Autre commune", next: "Q4P" }
		]
	},
	{
		id: "Q4P",
		text: "Préciser la ville",
		usesCommuneSelector: true,  // Add this flag to indicate it uses CommuneSelector
		next: "Q5"  // Explicitly set the next question
	},
	{
		id: "Q5",
		text: "Où vous rendez-vous ?",
		options: [
			{ id: 1, text: "Domicile", next: "Q6" },
			{ id: 2, text: "Travail habituel", next: "Q6" },
			{ id: 3, text: "Affaires professionnelles", next: "Q6" },
			{ id: 4, text: "Ecole, Lycée, Université", next: "Q6" },
			{ id: 5, text: "Démarches admin., médicales", next: "Q6" },
			{ id: 6, text: "Autres affaires personnelles", next: "Q6" },
			{ id: 7, text: "Loisirs", next: "Q6" },
			{ id: 8, text: "Achats", next: "Q6" },
			{ id: 9, text: "Restauration", next: "Q6" },
			{ id: 10, text: "Accompagnement", next: "Q6" },
			{ id: 11, text: "Autre", next: "Q6" },
			{ id: 12, text: "Sans réponse", next: "Q6" }
		]
	},
	{
		id: "Q6",
		text: "Préciser la ville",
		options: [
			{ id: 1, text: "Clamart", next: "Q7M-1Q" },
			{ id: 2, text: "Le Plessis-Robinson", next: "Q7M-1Q" },
			{ id: 3, text: "Châtenay Malabry", next: "Q7M-1Q" },
			{ id: 4, text: "Antony", next: "Q7M-1Q" },
			{ id: 5, text: "Autre commune", next: "Q6P" }
		]
	},
	{
		id: "Q6P",
		text: "Préciser la ville",
		usesCommuneSelector: true,  // Add this flag to indicate it uses CommuneSelector
		next: "Q7M-1Q"  // Explicitly set the next question
	},
	{
		id: "Q7M-1Q",
		text: "Avez vous utilisé un autre mode de transport avant d'arriver ici ? (M-1)",
		options: [
			{ id: 1, text: "Oui", next: "Q7M-1" },
			{ id: 2, text: "Non", next: "Q7M+1Q" }
		]
	},
	{
		id: "Q7M-1",
		text: "Citer dans l'ordre (départ -> arrivée) tous les modes de transports utilisés pour réaliser ce déplacement :",
		usesModeSelector: true,
		next: "Q7M-2Q"
	},
	{
		id: "Q7M-2Q",
		text: "Avez vous utilisé un autre mode de transport avant ? (M-2)",
		options: [
			{ id: 1, text: "Oui", next: "Q7M-2" },
			{ id: 2, text: "Non", next: "Q7M+1Q" }
		]
	},
	{
		id: "Q7M-2",
		text: "Citer dans l'ordre (départ -> arrivée) tous les modes de transports utilisés pour réaliser ce déplacement :",
		usesModeSelector: true,
		next: "Q7M-3Q"
	},
	{
		id: "Q7M-3Q",
		text: "Avez vous utilisé un autre mode de transport avant ? (M-3)",
		options: [
			{ id: 1, text: "Oui", next: "Q7M-3" },
			{ id: 2, text: "Non", next: "Q7M+1Q" }
		]
	},
	{
		id: "Q7M-3",
		text: "Citer dans l'ordre (départ -> arrivée) tous les modes de transports utilisés pour réaliser ce déplacement :",
		usesModeSelector: true,
		next: "Q7M+1Q"
	},
	{
		id: "Q7M+1Q",
		text: "Allez vous utiliser un autre mode de transport apres cette station ? (M+1)",
		options: [
			{ id: 1, text: "Oui", next: "Q7M+1" },
			{ id: 2, text: "Non", next: "Q8" }
		]
	},
	{
		id: "Q7M+1",
		text: "Citer dans l'ordre (départ -> arrivée) tous les modes de transports utilisés pour réaliser ce déplacement :",
		usesModeSelector: true,
		next: "Q7M+2Q"
	},
	{
		id: "Q7M+2Q",
		text: "Allez vous utiliser un autre mode de transport apres cette station ? (M+2)",
		options: [
			{ id: 1, text: "Oui", next: "Q7M+2" },
			{ id: 2, text: "Non", next: "Q8" }
		]
	},
	{
		id: "Q7M+2",
		text: "Citer dans l'ordre (départ -> arrivée) tous les modes de transports utilisés pour réaliser ce déplacement :",
		usesModeSelector: true,
		next: "Q7M+3Q"
	},
	{
		id: "Q7M+3Q",
		text: "Allez vous utiliser un autre mode de transport apres cette station ? (M+3)",
		options: [
			{ id: 1, text: "Oui", next: "Q7M+3" },
			{ id: 2, text: "Non", next: "Q8" }
		]
	},
	{
		id: "Q7M+3",
		text: "Citer dans l'ordre (départ -> arrivée) tous les modes de transports utilisés pour réaliser ce déplacement :",
		usesModeSelector: true,
		next: "Q8"
	},
	{
		id: "Q8",
		text: "Sexe",
		options: [
			{ id: 1, text: "Homme", next: "Q9" },
			{ id: 2, text: "Femme", next: "Q9" }
		]
	},
	{
		id: "Q9",
		text: "Age",
		freeText: true,
		next: "checkIfWeekend"
	},
	{
		id: "checkIfWeekend",
		isConditional: true,
		condition: () => {
			const today = new Date();
			const day = today.getDay();
			return day === 0 || day === 6;
		},
		nextIfTrue: "Q10bis",
		nextIfFalse: "Q10"
	},
	{
		id: "Q10",
		text: "Fréquence d'utilisation de la ligne",
		options: [
			{ id: 1, text: "Tous les jours ou presque", next: "Q11" },
			{ id: 2, text: "3 à 4 jours par semaine", next: "Q11" },
			{ id: 3, text: "1 à 2 jours par semaine", next: "Q11" },
			{ id: 4, text: "Moins souvent", next: "Q11" }
		]
	},
	{
		id: "Q10bis",
		text: "En week-end Avec quelle fréquence effectuez-vous ce déplacement de votre point de départ à votre point d'arrivée ?",
		options: [
			{ id: 1, text: "Tous les week-ends ou presque", next: "Q11" },
			{ id: 2, text: "Au moins 1 week-end sur 2", next: "Q11" },
			{ id: 3, text: "Environ 1 week-end par mois", next: "Q11" },
			{ id: 4, text: "Moins souvent", next: "Q11" },
			{ id: 5, text: "C'est la première fois", next: "Q11" },
			{ id: 6, text: "Sans réponse", next: "Q11" }
		]
	},
	{
		id: "Q11",
		text: "Titre de transport pour ce déplacement",
		options: [
			{ id: 1, text: "Forfait Navigo", next: "Q11_ForfaitNavigo" },
			{ id: 2, text: "Imagin'R", next: "Q12" },
			{ id: 3, text: "Navigo Liberté +", next: "Q12" },
			{ id: 4, text: "Navigo Easy", next: "Q11_NavigoEasy" },
			{ id: 5, text: "Forfait Améthyste", next: "Q12" },
			{ id: 6, text: "Titre à l'unité", next: "Q12" },
			{ id: 7, text: "Forfait Solidarité", next: "Q12" },
			{ id: 8, text: "Pas de titre", next: "Q12" },
			{ id: 9, text: "Sans Réponse", next: "Q12" }
		]
	},
	{
		id: "Q11_ForfaitNavigo",
		text: "Précisez",
		options: [
			{ id: 1, text: "An", next: "Q12" },
			{ id: 2, text: "Mois", next: "Q12" },
			{ id: 3, text: "Hebdo", next: "Q12" },
			{ id: 4, text: "Jour", next: "Q12" }
		]
	},
	{
		id: "Q11_NavigoEasy",
		text: "Précisez",
		options: [
			{ id: 1, text: "FNJ", next: "Q12" },
			{ id: 2, text: "T+", next: "Q12" },
			{ id: 3, text: "Autre titre", next: "Q12" }
		]
	},
	{
		id: "Q12",
		text: "Avant juin 2023, réalisiez-vous ce déplacement?",
		options: [
			{ id: 1, text: "Oui, mêmes lieux d'origine et destination", next: "Q15" },
			{ id: 2, text: "Oui, mais changement de lieu", next: "Q13" },
			{ id: 3, text: "Non", next: "Q14" }
		]
	},
	{
		id: "Q13",
		text: "Vous avez changé de lieu de...",
		options: [
			{ id: 1, text: "Loisir", next: "end" },
			{ id: 2, text: "Achat", next: "Q13b" },
			{ id: 3, text: "Restauration", next: "end" },
			{ id: 4, text: "Logement", next: "end" },
			{ id: 5, text: "Travail", next: "end" },
			{ id: 6, text: "Etudes", next: "end" },
			{ id: 7, text: "Démarches adm., méd", next: "end" },
			{ id: 8, text: "Affaires personnelles", next: "end" },
			{ id: 9, text: "Autre", next: "Q13P" }
		]
	},
	{
		id: "Q13P",
		text: "Précisez",
		freeText: true,
		next: "end"
	},
	{
		id: "Q13b",
		text: "Ce changement de lieu a-t-il été motivé par la création du T10 ?",
		options: [
			{ id: 1, text: "Oui", next: "Q14" },
			{ id: 2, text: "Non", next: "Q14" }
		]
	},
	{
		id: "Q14",
		text: "Pour quelles raisons?",
		options: [
			{ id: 1, text: "La création de ligne T10 vous a encouragé à réaliser ce nouveau déplacement", next: "end" },
			{ id: 2, text: "C'est mon premier emploi", next: "end" },
			{ id: 3, text: "Aujourd'hui déplacement exceptionnel", next: "Q14P" },
			{ id: 4, text: "Autre", next: "Q14P" }
		]
	},
	{
		id: "Q14P",
		text: "Préciser",
		freeText: true,
		next: "end"
	},
	{
		id: "Q15",
		text: "Il y a 2 ans, vous réalisiez ce déplacement en utilisant:",
		options: [
			{ id: 1, text: "UNIQUEMENT la voiture ou le 2 roues motorisé", next: "Q15a" },
			{ id: 2, text: "UNIQUEMENT la marche", next: "Q17" },
			{ id: 3, text: "D'autres modes de transport", next: "Q16" }
		]
	},
	{
		id: "Q15a",
		text: "Pourquoi avez-vous abandonné votre véhicule personnel ?",
		options: [
			{ id: 1, text: "Depuis la création de la ligne T10", next: "Q15b" },
			{ id: 2, text: "Coût élevé du véhicule", next: "Q15b" },
			{ id: 3, text: "Difficulté de circulation", next: "Q15b" },
			{ id: 4, text: "Difficulté de stationnement", next: "Q15b" },
			{ id: 5, text: "Panne du véhicule", next: "Q15b" },
			{ id: 6, text: "Autres facteurs", next: "Q15b" },
			{ id: 7, text: "Sans réponse", next: "Q15b" }
		]
	},
	{
		id: "Q15b",
		text: "Pour ce déplacement il y a deux ans, combien de km parcouriez-vous ?",
		freeText: true,
		next: "Q17"
	},
	{
		id: "Q16",
		text: "Citer dans l'ordre tous les modes de transports utilisés il y a 2 ans pour réaliser ce déplacement :",
		usesModeSelector: true,
		next: "Q16+1Q"
	},
	{
		id: "Q16+1Q",
		text: "Avez vous utiliser un autre mode de transport l y a 2 ans pour réaliser ce déplacement :",
		options: [
			{ id: 1, text: "Oui", next: "Q16+1" },
			{ id: 2, text: "Non", next: "Q17" }
		]
	},
	{
		id: "Q16+1",
		text: "Citer dans l'ordre tous les modes de transports utilisés il y a 2 ans pour réaliser ce déplacement :",
		usesModeSelector: true,
		next: "Q16+2Q"
	},
	{
		id: "Q16+2Q",
		text: "Avez vous utiliser un autre mode de transport l y a 2 ans pour réaliser ce déplacement :",
		options: [
			{ id: 1, text: "Oui", next: "Q16+2" },
			{ id: 2, text: "Non", next: "Q17" }
		]
	},
	{
		id: "Q16+2",
		text: "Citer dans l'ordre tous les modes de transports utilisés il y a 2 ans pour réaliser ce déplacement :",
		usesModeSelector: true,
		next: "Q16+3Q"
	},
	{
		id: "Q16+3Q",
		text: "Avez vous utiliser un autre mode de transport l y a 2 ans pour réaliser ce déplacement :",
		options: [
			{ id: 1, text: "Oui", next: "Q16+3" },
			{ id: 2, text: "Non", next: "Q17" }
		]
	},
	{
		id: "Q16+3",
		text: "Citer dans l'ordre tous les modes de transports utilisés il y a 2 ans pour réaliser ce déplacement :",
		usesModeSelector: true,
		next: "Q16+4Q"
	},
	{
		id: "Q16+4Q",
		text: "Avez vous utiliser un autre mode de transport l y a 2 ans pour réaliser ce déplacement :",
		options: [
			{ id: 1, text: "Oui", next: "Q16+4" },
			{ id: 2, text: "Non", next: "Q17" }
		]
	},
	{
		id: "Q16+4",
		text: "Citer dans l'ordre tous les modes de transports utilisés il y a 2 ans pour réaliser ce déplacement :",
		usesModeSelector: true,
		next: "Q17"
	},
	{
		id: "Q17",
		text: "Titre de transport avant juin 2023",
		options: [
			{ id: 1, text: "Même titre", next: "Q18" },
			{ id: 2, text: "Autre titre", next: "Q17P" }
		]
	},
	{
		id: "Q17P",
		text: "Titre de transport pour ce déplacement",
		options: [
			{ id: 1, text: "Forfait Navigo", next: "Q18" },
			{ id: 2, text: "Imagin'R", next: "Q18" },
			{ id: 3, text: "Navigo Liberté +", next: "Q18" },
			{ id: 4, text: "Navigo Easy", next: "Q18" },
			{ id: 5, text: "Forfait Améthyste", next: "Q18" },
			{ id: 6, text: "Titre à l'unité", next: "Q18" },
			{ id: 7, text: "Forfait Solidarité", next: "Q18" },
			{ id: 8, text: "Pas de titre", next: "Q18" },
			{ id: 9, text: "Sans Réponse", next: "Q18" }
		]
	},
	{
		id: "Q18",
		text: "Par rapport à il y a 2 ans, estimez-vous avoir gagné du temps pour réaliser ce même déplacement aujourd'hui ?",
		options: [
			{ id: 1, text: "Oui, gagné", subtext: "____ minutes", next: "end" },
			{ id: 2, text: "Non, perdu", subtext: "____ minutes", next: "end" },
			{ id: 3, text: "Temps équivalent", next: "end" },
			{ id: 4, text: "Sans réponse/NC", next: "end" }
		]
	},
];