const reservationForm = document.getElementById("reservationForm");

if (reservationForm) {
    const $ = window.jQuery;
    const categorie = document.getElementById("categorie");
    const voiture = document.getElementById("voiture");
    const dateDebut = document.getElementById("dateDebut");
    const dateFin = document.getElementById("dateFin");
    const prixTotal = document.getElementById("prixTotal");
    const message = document.getElementById("message");
    const voitureOptions = Array.from(voiture.querySelectorAll("option[data-category]"));

    $(".js-select2").select2({
        theme: "bootstrap-5",
        width: "100%"
    });

    $("#vehicleTable").DataTable({
        pageLength: 5,
        lengthChange: false,
        language: {
            emptyTable: "Aucun véhicule disponible",
            info: "Affichage de _START_ à _END_ sur _TOTAL_ véhicules",
            infoEmpty: "Aucun véhicule à afficher",
            infoFiltered: "(filtré parmi _MAX_ véhicules)",
            search: "Rechercher :",
            zeroRecords: "Aucun véhicule correspondant",
            paginate: {
                first: "Première",
                last: "Dernière",
                next: "Suivante",
                previous: "Précédente"
            }
        }
    });

    function synchroniserEtatSelect2(champ, invalide) {
        champ.classList.toggle("is-invalid", invalide);

        if ($(champ).hasClass("select2-hidden-accessible")) {
            $(champ).next(".select2-container")
                .find(".select2-selection")
                .toggleClass("is-invalid", invalide);
        }
    }

    function afficherMessage(texte, type) {
        message.textContent = texte;
        message.className = `col-12 alert alert-${type} mb-0`;
    }

    function effacerMessage() {
        message.textContent = "";
        message.className = "col-12";
    }

    function mettreAJourDates() {
        dateFin.setCustomValidity("");

        if (dateDebut.value && dateFin.value && dateFin.value < dateDebut.value) {
            dateFin.setCustomValidity("La date de fin doit être égale ou postérieure à la date de début.");
        }

        dateFin.min = dateDebut.value;
    }

    function mettreAJourVoitures() {
        const categorieChoisie = categorie.value;
        const $voiture = $("#voiture");

        $voiture.val("");
        voitureOptions.forEach((option) => {
            option.remove();

            if (option.dataset.category === categorieChoisie) {
                $voiture.append(option);
            }
        });

        voiture.disabled = !categorieChoisie;

        prixTotal.value = "";
        synchroniserEtatSelect2(categorie, false);
        synchroniserEtatSelect2(voiture, false);
        $voiture.trigger("change.select2");
    }

    function calculerPrix() {
        mettreAJourDates();

        const champsRequis = [categorie, voiture, dateDebut, dateFin];
        champsRequis.forEach((champ) => {
            synchroniserEtatSelect2(champ, !champ.value || !champ.validity.valid);
        });

        if (champsRequis.some((champ) => !champ.value || !champ.validity.valid)) {
            afficherMessage("Sélectionnez une catégorie, une voiture et des dates de location valides.", "danger");
            return false;
        }

        const debut = Date.parse(`${dateDebut.value}T00:00:00Z`);
        const fin = Date.parse(`${dateFin.value}T00:00:00Z`);
        const nombreJours = Math.max(1, (fin - debut) / 86400000);
        const total = nombreJours * Number(voiture.value);

        prixTotal.value = `${total} DT`;
        return true;
    }

    document.getElementById("calculatePrice").addEventListener("click", calculerPrix);

    $(categorie).on("change", () => {
        mettreAJourVoitures();
        effacerMessage();
    });
    mettreAJourVoitures();

    dateDebut.addEventListener("change", () => {
        mettreAJourDates();
        effacerMessage();
    });

    [voiture, dateDebut, dateFin].forEach((champ) => {
        champ.addEventListener("change", () => {
            synchroniserEtatSelect2(champ, false);
            prixTotal.value = "";
            effacerMessage();
        });
    });

    reservationForm.addEventListener("input", () => {
        prixTotal.value = "";
        effacerMessage();
    });

    reservationForm.addEventListener("submit", (event) => {
        event.preventDefault();
        mettreAJourDates();
        reservationForm.classList.add("was-validated");

        if (!reservationForm.checkValidity()) {
            [categorie, voiture].forEach((champ) => {
                synchroniserEtatSelect2(champ, !champ.value || !champ.validity.valid);
            });
            afficherMessage("Vérifiez les champs signalés avant de confirmer la réservation.", "danger");
            return;
        }

        if (calculerPrix()) {
            afficherMessage("Réservation validée avec succès.", "success");
        }
    });
}
