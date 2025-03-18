


export const questions = [
	{
		id: "Q1",
		text: "De quelle commune venez vous ?",
		options: [
			{ id: 1, text: "Saint-Mard", next: "Q2" },
			{ id: 2, text: "Juilly", next: "Q2" },
			{ id: 3, text: "-en-Goële", next: "Q2" },
			{ id: 4, text: "Longperrier", next: "Q2" },
			{ id: 5, text: "Rouvres", next: "Q2" },
			{ id: 6, text: "Othis", next: "Q2" },
			{ id: 7, text: "Saint Pathus", next: "Q2" },
			{ id: 8, text: "Villeneuve-sous-", next: "Q2" },
			{ id: 9, text: "Lagny-le-Sec", next: "Q2" },
			{ id: 10, text: "Le Plessis-Belleville", next: "Q2" },
			{ id: 11, text: "Autre: Précisez la ville", next: "Q1P" }
		]
	},
	{
		id: "Q1P",
		text: "Quelle est votre commune de résidence",
		usesCommuneSelector: true,  // Add this flag to indicate it uses CommuneSelector
		next: "Q2"  // Explicitly set the next question
	},
	{
		id: "Q2",
		text: "Ce lieu est-il …. ? ",
		options: [
			{ id: 1, text: "votre domicile", next: "Q3" },
			{ id: 2, text: "votre lieu de travail habituel", next: "Q3" },
			{ id: 3, text: "un lieu de rendez-vous professionnel", next: "Q3" },
			{ id: 4, text: "votre établissement scolaire", next: "Q3" },
			{ id: 5, text: "un lieu d'achats, courses, …", next: "Q3" },
			{ id: 6, text: "un lieu de loisirs", next: "Q3" }
		]
	},
	{
		id: "Q3",
		text: "Par quel mode de transport êtes-vous venus jusqu'à la gare ? ",
		options: [
			{ id: 1, text: "à pied exclusivement", next: "Q11" },
			{ id: 2, text: "en voiture puis bus", next: "Q10" },
			{ id: 3, text: "en bus/car exclusivement", next: "Q4" },
			{ id: 4, text: "en voiture conducteur", next: "Q5" },
			{ id: 5, text: "en voiture passager (covoiturage ou dépose)", next: "Q9" },
			{ id: 6, text: "en vélo", next: "Q11" },
			{ id: 7, text: "en deux-roues motorisés", next: "Q11" },
			{ id: 8, text: "en train", next: "Q11" },
			{ id: 9, text: "Autre : Précisez", next: "Q3Precision" }
		]
	},
	{
		id: "Q3Precision",
		text: "Précisez la raison",
		freeText: true,
		next: "Q4"
	},

	{
		id: "Q4",
		text: "Si vous êtes venus en bus, préciser la ligne de bus utilisée : ",
		options: [
			{ id: 1, text: "2122", next: "Q11" },
			{ id: 2, text: "2103", next: "Q11" },
			{ id: 3, text: "2107", next: "Q11" },
			{ id: 4, text: "2108", next: "Q11" },
			{ id: 5, text: "2109", next: "Q11" },
			{ id: 6, text: "2110", next: "Q11" },
			{ id: 7, text: "2111", next: "Q11" },
			{ id: 8, text: "2153", next: "Q11" },
			{ id: 9, text: "2154", next: "Q11" },
			{ id: 10, text: "Filéo", next: "Q11" },
			{ id: 11, text: "TAD de la Goele 1 et 2", next: "Q11" }
		]
	},
	{
		id: "Q5",
		text: "Si vous êtes venus en voiture comme conducteur Où avez-vous stationné votre voiture ? ",
		options: [
			{ id: 1, text: "Parking relais Pasteur", next: "Q6" },
			{ id: 2, text: "Parking relais Europe", next: "Q6" },
			{ id: 3, text: "Parking relais Sud", next: "Q6" },
			{ id: 4, text: "Stationnement sur voirie", next: "Q7" },
			{ id: 5, text: "Sur les places de taxi/dépose minute devant la gare", next: "Q7" },
			{ id: 6, text: "Autre : Précisez", next: "Q5Precision" }
		]
	},
	{
		id: "Q5Precision",
		text: "Précisez",
		freeText: true,
		next: "Q7"
	},
	{
		id: "Q6",
		text: "Si vous avez stationné dans un des parkings relais, disposez-vous d'un abonnement ?",
		options: [
			{ id: 1, text: "Oui", next: "Q8" },
			{ id: 2, text: "Non", next: "Q8" },
		]
	},
	{
		id: "Q7",
		text: "Si vous êtes venus en voiture comme conducteur et que vous ne stationnez pas dans un des trois parkings relais. Pour quelle raison n'utilisez vous pas les parkings relais (choix multiples) ?",
		allowMultiple: true,
		options: [
			{ id: 1, text: "Manque de place de stationnement disponible", next: "Q8" },
			{ id: 2, text: "Absence d'abonnement disponible", next: "Q8" },
			{ id: 3, text: "Pas d'abonnement Navigo annuel permettant d'accéder gratuitement aux parkings", next: "Q8" },
			{ id: 4, text: "Coût du stationnement", next: "Q8" },
			{ id: 5, text: "Dysfonctionnement technique", next: "Q8" },
			{ id: 6, text: "Autre", next: "Q7Precision" }
		]
	},
	{
		id: "Q7Precision",
		text: "Précisez",
		freeText: true,
		next: "Q8"
	},
	{
		id: "Q8",
		text: "Si vous êtes venus en voiture comme conducteur quelle est votre durée habituelle de stationnement?",
		options: [
			{ id: 1, text: "Courte durée (<2h)", next: "Q11" },
			{ id: 2, text: "Moyenne durée (2 à 6h)", next: "Q11" },
			{ id: 3, text: "Longue durée (>6h)", next: "Q11" },
			{ id: 4, text: "Très longue durée (>12h)", next: "Q11" }
		]
	},
	{
		id: "Q9",
		text: "Si vous êtes venus en voiture comme passager Où avez-vous été déposé ?",
		options: [
			{ id: 1, text: "sur les places de dépose minute devant la gare", next: "Q11" },
			{ id: 2, text: "devant le bâtiment voyageurs par la voirie dépose minute", next: "Q11" },
			{ id: 3, text: "devant le bâtiment voyageurs par la voirie gare routière", next: "Q11" },
			{ id: 4, text: "Autre : Précisez", next: "Q9Precision" }
		]
	},
	{
		id: "Q9Precision",
		text: "Précisez",
		freeText: true,
		next: "Q11"
	},
	{
		id: "Q10",
		text: "Si vous êtes venus en voiture puis bus. Dans quelle commune avez-vous stationné votre voiture ?",
		options: [
			{ id: 1, text: "Saint-Mard", next: "Q11" },
			{ id: 2, text: "Juilly", next: "Q11" },
			{ id: 3, text: "Dammartin-en-Goële", next: "Q11" },
			{ id: 4, text: "Longperrier", next: "Q11" },
			{ id: 5, text: "Autre : Précisez la ville", next: "Q10P" }
		]
	},
	{
		id: "Q10P",
		text: "Précisez la ville",
		usesCommuneSelector: true,
		next: "Q11"
	},
	{
		id: "Q11",
		text: "Pour ce trajet en train, quelle est votre gare de descente ?",
		options: [
			{ id: 1, text: "Crépy en Valois", next: "Q12" },
			{ id: 2, text: "Ormoy Villers", next: "Q12" },
			{ id: 3, text: "Nanteuil le Haudoin", next: "Q12" },
			{ id: 4, text: "Le Plessis Belleville", next: "Q12" },
			{ id: 5, text: "Dammartin Juilly Saint-Mard", next: "Q12" },
			{ id: 6, text: "Thieux Nantouillet", next: "Q12" },
			{ id: 7, text: "Compans", next: "Q12" },
			{ id: 8, text: "Mitry-Claye", next: "Q12" },
			{ id: 9, text: "Aulnay sous Bois", next: "Q12" },
			{ id: 10, text: "Paris Gare du Nord", next: "Q12" },
			{ id: 11, text: "Autre : Précisez", next: "Q11Precision" }
		]
	},
	{
		id: "Q11Precision",
		text: "Précisez",
		freeText: true,
		next: "Q12"
	},
	{
		id: "Q12",
		text: "Quel est le motif de votre déplacement ?",
		options: [
			{ id: 1, text: "Aller sur votre lieu de travail habituel", next: "Q13" },
			{ id: 2, text: "Rentrer à votre domicile", next: "Q13" },
			{ id: 3, text: "Un lieu de rendez-vous professionnel", next: "Q13" },
			{ id: 4, text: "Votre établissement scolaire, université …", next: "Q13" },
			{ id: 5, text: "Un lieu d'achats, courses, …", next: "Q13" },
			{ id: 6, text: "Un lieu de loisirs", next: "Q13" },
			{ id: 7, text: "Autre : Précisez", next: "Q12Precision" }
		]
	},
	{
		id: "Q12Precision",
		text: "Précisez",
		freeText: true,
		next: "Q13"
	},
	{
		id: "Q13",
		text: "A quelle fréquence faites-vous le trajet d'aujourd'hui ? ",
		options: [
			{ id: 1, text: "En semaine, entre 3 et 5 fois", next: "end" },
			{ id: 2, text: "En semaine, moins de 3 fois", next: "end" },
			{ id: 3, text: "Le week-end principalement", next: "end" },
			{ id: 4, text: "Moins d'une fois par semaine", next: "end" },
			{ id: 5, text: "Moins d'une fois par mois", next: "end" }
		]
	}
];

