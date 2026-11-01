const categories = ["Citadine", "Berline", "Commerciale"];
let vehicles = [];

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    const themeIcon = document.getElementById("themeIcon");
    const themeLabel = document.getElementById("themeLabel");
    const storageKey = "auto-rent-theme";

    function applyTheme(theme) {
        const isDark = theme === "dark";
        document.documentElement.setAttribute("data-bs-theme", theme);
        themeIcon.textContent = isDark ? "☀" : "☾";
        themeLabel.textContent = isDark ? "Mode clair" : "Mode sombre";
        themeToggle.setAttribute("aria-label", isDark ? "Activer le mode clair" : "Activer le mode sombre");
        themeToggle.setAttribute("aria-pressed", String(isDark));
    }

    applyTheme(localStorage.getItem(storageKey) ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
    themeToggle.addEventListener("click", () => {
        const nextTheme = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
        localStorage.setItem(storageKey, nextTheme);
        applyTheme(nextTheme);
    });
}

const vehicleCarousel = document.getElementById("vehicleCarousel");
if (vehicleCarousel) {
    const slides = Array.from(vehicleCarousel.querySelectorAll(".carousel-item"));
    const indicators = Array.from(vehicleCarousel.querySelectorAll(".carousel-indicators button"));
    if (!window.bootstrap?.Carousel) {
        let activeSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));
        const showSlide = (index) => {
            activeSlide = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle("active", i === activeSlide));
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle("active", i === activeSlide);
                if (i === activeSlide) indicator.setAttribute("aria-current", "true");
                else indicator.removeAttribute("aria-current");
            });
        };
        vehicleCarousel.querySelectorAll("[data-bs-slide]").forEach((control) => {
            control.addEventListener("click", () => showSlide(activeSlide + (control.dataset.bsSlide === "next" ? 1 : -1)));
        });
        indicators.forEach((indicator, index) => indicator.addEventListener("click", () => showSlide(index)));
    }
}

const mainNavigation = document.getElementById("mainNavigation");
const navigationToggle = document.querySelector('[data-bs-target="#mainNavigation"]');
if (mainNavigation && navigationToggle) {
    if (window.bootstrap?.Collapse) {
        mainNavigation.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", () => {
                if (mainNavigation.classList.contains("show")) {
                    window.bootstrap.Collapse.getOrCreateInstance(mainNavigation).hide();
                }
            });
        });
    } else {
        mainNavigation.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", () => {
                mainNavigation.classList.remove("show");
                navigationToggle.setAttribute("aria-expanded", "false");
            });
        });
        navigationToggle.addEventListener("click", () => {
            const expanded = !mainNavigation.classList.contains("show");
            mainNavigation.classList.toggle("show", expanded);
            navigationToggle.setAttribute("aria-expanded", String(expanded));
        });
    }
}

function enableSearchableSelects(root = document) {
    if (!window.jQuery || !window.jQuery.fn.select2) return;
    window.jQuery(root).find(".js-select2").each(function () {
        const select = window.jQuery(this);
        if (!select.hasClass("select2-hidden-accessible")) {
            select.select2({ width: "100%", placeholder: select.data("placeholder") || "Sélectionner…" });
        }
    });
}

function parseVehicleCsv(text) {
    const rows = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
    const expectedHeader = "id,category,brand,model,power,pricePerDay,available";
    if (rows.shift() !== expectedHeader) {
        throw new Error("L'en-tête de data/vehicles.csv ne correspond pas au format requis.");
    }

    const parsed = rows.map((row, index) => {
        const fields = row.split(",");
        if (fields.length !== 7) throw new Error(`Ligne CSV ${index + 2} invalide.`);
        const [id, category, brand, model, power, pricePerDay, available] = fields;
        const vehicle = {
            id: Number(id),
            category,
            brand,
            model,
            power: Number(power),
            pricePerDay: Number(pricePerDay),
            available: available === "true"
        };
        if (!Number.isInteger(vehicle.id) || !categories.includes(category) || !brand || !model ||
            !Number.isFinite(vehicle.power) || vehicle.power <= 0 ||
            !Number.isFinite(vehicle.pricePerDay) || vehicle.pricePerDay <= 0 ||
            !["true", "false"].includes(available)) {
            throw new Error(`Données invalides à la ligne CSV ${index + 2}.`);
        }
        return vehicle;
    });
    if (parsed.length < 50) throw new Error("Le catalogue doit contenir au moins 50 véhicules.");
    return parsed;
}

function createVehicleCard(vehicle) {
    const article = document.createElement("article");
    article.className = "vehicle-item";
    article.dataset.category = vehicle.category;
    const image = vehicle.category === "Berline" ? "./images/berline.jpg" :
        vehicle.category === "Commerciale" ? "./images/commerciale.jpg" : "./images/citadine.jpg";
    article.innerHTML = `
        <div class="vehicle-card h-100">
            <div class="vehicle-image">
                <img src="${image}" alt="${vehicle.brand} ${vehicle.model}" loading="lazy">
                <span class="category-tag">${vehicle.category}</span>
            </div>
            <div class="vehicle-card-body">
                <div class="d-flex justify-content-between align-items-start gap-2">
                    <div><p class="vehicle-make mb-1"></p><h3 class="h5 mb-0"></h3></div>
                    <span class="vehicle-power">${vehicle.power} CV</span>
                </div>
                <div class="vehicle-card-footer">
                    <p class="vehicle-price mb-0"><strong>${vehicle.pricePerDay} DT</strong><span>/ jour</span></p>
                    <a class="btn btn-primary btn-sm" href="#reservation">Réserver <span aria-hidden="true">→</span></a>
                </div>
            </div>
        </div>`;
    article.querySelector(".vehicle-make").textContent = vehicle.brand;
    article.querySelector("h3").textContent = vehicle.model;
    const bookLink = article.querySelector("a");
    bookLink.dataset.bookCategory = vehicle.category;
    bookLink.dataset.bookVehicle = String(vehicle.id);
    if (!vehicle.available) {
        article.querySelector(".vehicle-card-footer").innerHTML =
            `<span class="badge text-bg-secondary">Indisponible</span><span>${vehicle.pricePerDay} DT / jour</span>`;
    }
    return article;
}

function updateVehicleOptions(select, category) {
    if (!select) return;
    const available = vehicles.filter((vehicle) => vehicle.available && (!category || vehicle.category === category));
    select.replaceChildren(new Option(category ? "-- Sélectionner une voiture --" : "-- Sélectionner une catégorie d'abord --", ""));
    available.forEach((vehicle) => {
        select.add(new Option(`${vehicle.brand} ${vehicle.model} — ${vehicle.pricePerDay} DT/jour`, String(vehicle.id)));
    });
    select.disabled = !category;
    if (window.jQuery && window.jQuery.fn.select2) window.jQuery(select).trigger("change");
}

function onSelectChange(select, handler) {
    if (window.jQuery) {
        window.jQuery(select).on("change", handler);
    } else {
        select.addEventListener("change", handler);
    }
}

function setupStaticReservationForm() {
    const form = document.getElementById("reservationForm");
    const category = document.getElementById("categorie");
    const vehicle = document.getElementById("voiture");
    const startDate = document.getElementById("dateDebut");
    const endDate = document.getElementById("dateFin");
    const totalPrice = document.getElementById("prixTotal");
    const message = document.getElementById("message");
    const vehicleOptions = Array.from(vehicle.querySelectorAll("option[data-category]"));
    const localDate = new Date();
    const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
    startDate.min = today;

    const showMessage = (text, state) => {
        message.textContent = text;
        message.dataset.state = state;
    };
    const updateOptions = () => {
        const placeholder = new Option(
            category.value ? "-- Sélectionner une voiture --" : "-- Sélectionner une catégorie d'abord --",
            ""
        );
        const matching = vehicleOptions
            .filter((option) => option.dataset.category === category.value)
            .map((option) => option.cloneNode(true));
        vehicle.replaceChildren(placeholder, ...matching);
        vehicle.disabled = !category.value;
        totalPrice.value = "";
    };
    const calculate = () => {
        endDate.min = startDate.value || today;
        endDate.setCustomValidity("");
        if (endDate.value && startDate.value && endDate.value < startDate.value) {
            endDate.setCustomValidity("La date de fin doit être égale ou postérieure à la date de début.");
        }
        if (!form.checkValidity()) {
            showMessage("Vérifiez les champs obligatoires et les dates indiqués.", "error");
            form.reportValidity();
            return false;
        }
        const days = Math.max(1, (Date.parse(`${endDate.value}T00:00:00Z`) -
            Date.parse(`${startDate.value}T00:00:00Z`)) / 86400000);
        totalPrice.value = `${days * Number(vehicle.value)} DT`;
        showMessage(`Prix estimé : ${totalPrice.value} pour ${days} jour${days > 1 ? "s" : ""}.`, "success");
        return true;
    };

    category.addEventListener("change", () => {
        updateOptions();
        showMessage("", "");
    });
    vehicle.addEventListener("change", () => {
        totalPrice.value = "";
        showMessage("", "");
    });
    [startDate, endDate].forEach((input) => input.addEventListener("change", () => {
        totalPrice.value = "";
        showMessage("", "");
    }));
    document.getElementById("calculatePrice").addEventListener("click", calculate);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (calculate()) showMessage("Réservation validée avec succès (simulation locale).", "success");
    });
}

function setupReservationForm() {
    const form = document.getElementById("reservationForm");
    if (!form) return;
    const category = document.getElementById("categorie");
    const vehicle = document.getElementById("voiture");
    const startDate = document.getElementById("dateDebut");
    const endDate = document.getElementById("dateFin");
    const totalPrice = document.getElementById("prixTotal");
    const dailyRate = document.getElementById("dailyRate");
    const message = document.getElementById("message");
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    startDate.min = localToday;

    const setMessage = (text, type) => {
        message.textContent = text;
        message.className = text ? `col-12 alert alert-${type} mb-0` : "col-12";
    };
    const updateDates = () => {
        endDate.min = startDate.value || localToday;
        endDate.setCustomValidity("");
        if (endDate.value && startDate.value && endDate.value < startDate.value) {
            endDate.setCustomValidity("La date de fin doit être égale ou postérieure à la date de début.");
        }
    };
    const calculate = () => {
        updateDates();
        form.classList.add("was-validated");
        if (!form.checkValidity()) {
            setMessage("Vérifiez les champs signalés et choisissez des dates valides.", "danger");
            return false;
        }
        const selected = vehicles.find((item) => item.id === Number(vehicle.value) && item.available);
        if (!selected) {
            setMessage("Cette voiture n'est pas disponible. Choisissez un autre modèle.", "danger");
            return false;
        }
        const days = Math.max(1, (Date.parse(`${endDate.value}T00:00:00Z`) - Date.parse(`${startDate.value}T00:00:00Z`)) / 86400000);
        if (dailyRate) dailyRate.textContent = `Tarif journalier : ${selected.pricePerDay} DT`;
        totalPrice.value = `${days * selected.pricePerDay} DT`;
        setMessage("", "");
        return true;
    };

    onSelectChange(category, () => {
        updateVehicleOptions(vehicle, category.value);
        totalPrice.value = "";
        if (dailyRate) dailyRate.textContent = "Sélectionnez un véhicule disponible pour afficher le tarif journalier.";
        setMessage("", "");
    });
    onSelectChange(vehicle, () => {
        const selected = vehicles.find((item) => item.id === Number(vehicle.value) && item.available);
        if (dailyRate) dailyRate.textContent = selected
            ? `Tarif journalier : ${selected.pricePerDay} DT`
            : "Sélectionnez un véhicule disponible pour afficher le tarif journalier.";
        totalPrice.value = "";
        setMessage("", "");
    });
    [startDate, endDate].forEach((field) => field.addEventListener("change", () => {
        updateDates();
        totalPrice.value = "";
        setMessage("", "");
    }));
    document.getElementById("calculatePrice").addEventListener("click", calculate);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (calculate()) setMessage("Votre demande a été vérifiée. Cette démonstration ne transmet pas les réservations.", "success");
    });
    document.querySelectorAll("[data-book-category]").forEach((link) => {
        link.addEventListener("click", () => {
            const requestedCategory = categories.find((item) => item.toLocaleLowerCase("fr") === link.dataset.bookCategory.toLocaleLowerCase("fr"));
            if (!requestedCategory) return;
            category.value = requestedCategory;
            if (window.jQuery) window.jQuery(category).trigger("change");
            else category.dispatchEvent(new Event("change"));
            if (link.dataset.bookVehicle) vehicle.value = link.dataset.bookVehicle;
            if (window.jQuery) window.jQuery(vehicle).trigger("change");
            else vehicle.dispatchEvent(new Event("change"));
        });
    });
}

function setupCatalogTable() {
    const tableBody = document.getElementById("vehicleTableBody");
    if (!tableBody) return;
    tableBody.replaceChildren();
    vehicles.forEach((vehicle) => {
        const row = tableBody.insertRow();
        [vehicle.id, vehicle.category, `${vehicle.brand} ${vehicle.model}`, `${vehicle.power} CV`,
            `${vehicle.pricePerDay} DT`, vehicle.available ? "Disponible" : "Indisponible"]
            .forEach((value) => { row.insertCell().textContent = value; });
    });
    if (window.jQuery && window.jQuery.fn.DataTable) {
        window.jQuery("#vehicleTable").DataTable({
            language: { url: "https://cdn.datatables.net/plug-ins/2.3.4/i18n/fr-FR.json" },
            pageLength: 10,
            order: [[1, "asc"], [2, "asc"]]
        });
    }
    document.getElementById("vehicleTableCard").classList.remove("d-none");
}

function setupVehicleGridFilters() {
    const grid = document.getElementById("vehicleGrid");
    if (!grid) return;
    const searchInput = document.getElementById("vehicleSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const clearFilters = document.getElementById("clearFilters");
    const count = document.getElementById("vehicleCount");
    const noVehicles = document.getElementById("noVehicles");
    const filter = () => {
        const query = searchInput.value.trim().toLocaleLowerCase("fr");
        const category = categoryFilter.value;
        let visible = 0;
        grid.querySelectorAll(".vehicle-item").forEach((card) => {
            const matches = card.textContent.toLocaleLowerCase("fr").includes(query) &&
                (!category || card.dataset.category === category);
            card.classList.toggle("d-none", !matches);
            visible += Number(matches);
        });
        noVehicles.classList.toggle("d-none", visible > 0);
        count.textContent = `${visible} véhicule${visible > 1 ? "s" : ""} trouvé${visible > 1 ? "s" : ""}`;
    };
    searchInput.addEventListener("input", filter);
    categoryFilter.addEventListener("change", filter);
    clearFilters.addEventListener("click", () => {
        searchInput.value = "";
        categoryFilter.value = "";
        filter();
        searchInput.focus();
    });
    document.querySelectorAll("[data-category-filter]").forEach((link) => {
        link.addEventListener("click", () => {
            categoryFilter.value = link.dataset.categoryFilter;
            searchInput.value = "";
            filter();
        });
    });
    filter();
}

function setupContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const feedback = document.getElementById("contactFeedback");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        form.classList.add("was-validated");
        if (!form.checkValidity()) {
            feedback.textContent = "Veuillez corriger les champs signalés.";
            feedback.className = "alert alert-danger";
            form.reportValidity();
            return;
        }
        feedback.textContent = "Votre message est valide. La démonstration ne l'envoie pas à un serveur.";
        feedback.className = "alert alert-success";
        form.reset();
        form.classList.remove("was-validated");
    });
}

function setupQuoteForm() {
    const form = document.getElementById("quoteForm");
    if (!form) return;
    const category = document.getElementById("quoteCategory");
    const vehicle = document.getElementById("quoteVehicle");
    const start = document.getElementById("quoteStart");
    const end = document.getElementById("quoteEnd");
    const output = document.getElementById("quoteResult");
    const feedback = document.getElementById("quoteFeedback");
    const printButton = document.getElementById("printQuote");
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    start.min = localToday;
    const updateEndDate = () => {
        end.min = start.value || localToday;
        end.setCustomValidity(end.value && start.value && end.value < start.value ? "La date de fin doit suivre la date de début." : "");
    };
    onSelectChange(category, () => updateVehicleOptions(vehicle, category.value));
    start.addEventListener("change", updateEndDate);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        updateEndDate();
        form.classList.add("was-validated");
        if (!form.checkValidity()) {
            feedback.textContent = "Complétez les champs et corrigez les dates.";
            feedback.className = "alert alert-danger";
            return;
        }
        const selected = vehicles.find((item) => item.id === Number(vehicle.value) && item.available);
        if (!selected) {
            feedback.textContent = "Choisissez un véhicule disponible.";
            feedback.className = "alert alert-danger";
            return;
        }
        const days = Math.max(1, (Date.parse(`${end.value}T00:00:00Z`) - Date.parse(`${start.value}T00:00:00Z`)) / 86400000);
        document.getElementById("quoteCustomer").textContent = document.getElementById("quoteName").value;
        document.getElementById("quoteVehicleCategory").textContent = selected.category;
        document.getElementById("quoteCar").textContent = `${selected.brand} ${selected.model}`;
        document.getElementById("quoteStartDate").textContent = start.value;
        document.getElementById("quoteEndDate").textContent = end.value;
        document.getElementById("quoteDays").textContent = `${days} jour${days > 1 ? "s" : ""}`;
        document.getElementById("quoteDailyPrice").textContent = `${selected.pricePerDay} DT`;
        document.getElementById("quoteTotal").textContent = `${days * selected.pricePerDay} DT`;
        output.hidden = false;
        feedback.textContent = "Votre devis est prêt à être imprimé.";
        feedback.className = "alert alert-success";
        printButton.hidden = false;
    });
    printButton.addEventListener("click", () => window.print());
}

async function loadVehicleData() {
    const status = document.getElementById("vehicleDataStatus");
    const grid = document.getElementById("vehicleGrid");
    const noVehicles = document.getElementById("noVehicles");
    if (grid) {
        grid.replaceChildren(noVehicles);
        document.getElementById("vehicleCount").textContent = "Chargement du catalogue…";
    }
    try {
        let csvText;
        if (window.location.protocol === "file:") {
            if (typeof window.vehicleCsv !== "string") {
                throw new Error("Le fichier local de données data/vehicles.js n'a pas été chargé.");
            }
            csvText = window.vehicleCsv;
        } else {
            const response = await fetch("./data/vehicles.csv");
            if (!response.ok) throw new Error(`Chargement du catalogue impossible (HTTP ${response.status}).`);
            csvText = await response.text();
        }
        vehicles = parseVehicleCsv(csvText);
        if (grid) {
            grid.replaceChildren(...vehicles.map(createVehicleCard), noVehicles);
            setupVehicleGridFilters();
        }
        setupCatalogTable();
        setupReservationForm();
        setupQuoteForm();
        enableSearchableSelects();
        if (status) status.textContent = `${vehicles.length} véhicules chargés depuis le fichier CSV.`;
    } catch (error) {
        if (status) {
            status.textContent = `Impossible de charger les véhicules : ${error.message}`;
            status.className = "alert alert-danger";
        }
        const message = document.getElementById("message");
        if (message) {
            message.textContent = "Impossible de charger le catalogue. Vérifiez data/vehicles.csv et servez le site via HTTP.";
            message.className = "col-12 alert alert-danger";
        }
        throw error;
    }
}

setupContactForm();
const staticReservationForm = document.querySelector("#reservationForm[data-static-catalog]");
if (staticReservationForm) setupStaticReservationForm();
if (document.getElementById("vehicleGrid") || document.getElementById("vehicleTableBody") ||
    (document.getElementById("reservationForm") && !staticReservationForm) || document.getElementById("quoteForm")) {
    loadVehicleData().catch((error) => console.error(error));
}
