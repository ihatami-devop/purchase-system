const componentElement = document.getElementById("component-data");
const componentData = JSON.parse(componentElement.textContent);
const apiBaseUrl = (componentElement.dataset.apiUrl || "http://localhost:5001").replace(/\/$/, "");
const categoryOrder = ["CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case", "Cooling"];
const baseCategories = ["CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU"];
const addonCategories = ["Case", "Cooling"];
const selectedComponents = { Case: componentData.Case[0] };
let activeTab = "base";
let activeCategory = "CPU";
let purchaseInFlight = false;
let purchaseError = "";

const formatPrice = amount => `$${Number(amount).toFixed(2)}`;
const getProduct = (category, id) => componentData[category].find(product => product.id === id);

function compatibilityWarnings(category, product) {
    const warnings = [];
    const selected = { ...selectedComponents, [category]: product };
    const cpu = selected.CPU;
    const board = selected.Motherboard;
    const ram = selected.RAM;
    const gpu = selected.GPU;
    const psu = selected.PSU;
    const pcCase = selected.Case;
    const cooler = selected.Cooling;

    if (cpu && board && cpu.socket !== board.socket) {
        if (category === "CPU" || category === "Motherboard") warnings.push(`Socket mismatch: ${cpu.socket} CPU requires a matching motherboard.`);
    }
    if (board && ram && board.memory_type !== ram.memory_type) {
        if (category === "RAM" || category === "Motherboard") warnings.push(`${ram.memory_type} memory is incompatible with this ${board.memory_type} motherboard.`);
    }
    if (board && pcCase && !pcCase.form_factors.includes(board.form_factor)) {
        if (category === "Case" || category === "Motherboard") warnings.push(`${board.form_factor} motherboard does not fit this case.`);
    }
    if (gpu && pcCase && gpu.length > pcCase.gpu_clearance) {
        if (category === "GPU" || category === "Case") warnings.push(`GPU is ${gpu.length - pcCase.gpu_clearance}mm longer than the case clearance.`);
    }
    if (psu && (cpu || gpu)) {
        const expectedLoad = (Number(cpu?.tdp || 0) + Number(gpu?.power || 0)) * 1.25;
        if (psu.wattage < expectedLoad && category === "PSU") warnings.push(`Estimated load is about ${Math.ceil(expectedLoad)}W; choose a higher wattage PSU.`);
    }
    if (cpu && cooler && !cooler.supported_sockets.includes(cpu.socket)) {
        if (category === "CPU" || category === "Cooling") warnings.push(`${cooler.name} does not support the ${cpu.socket} CPU socket.`);
    }
    return warnings;
}

function getWarningsForSelection(category) {
    const product = selectedComponents[category];
    return product ? compatibilityWarnings(category, product) : [];
}

function activeCategories() {
    if (activeTab === "base") return baseCategories;
    return addonCategories;
}

function renderCategoryNavigation() {
    const nav = document.getElementById("category-navigation");
    nav.replaceChildren();
    activeCategories().forEach(category => {
        const button = document.createElement("button");
        const product = selectedComponents[category];
        button.type = "button";
        button.className = "category-chip";
        button.classList.toggle("active", category === activeCategory);
        button.classList.toggle("has-warning", getWarningsForSelection(category).length > 0);
        button.setAttribute("aria-pressed", String(category === activeCategory));
        const label = document.createElement("span");
        label.textContent = category;
        const value = document.createElement("small");
        value.textContent = product ? product.name : "Select an option";
        button.append(label, value);
        button.addEventListener("click", () => {
            activeCategory = category;
            render();
        });
        nav.append(button);
    });
}

function renderProductOptions() {
    const container = document.getElementById("product-options");
    const title = document.getElementById("active-category-title");
    const brandFilter = document.getElementById("brand-filter");
    const products = componentData[activeCategory] || [];
    title.textContent = activeCategory;

    const brands = [...new Set(products.map(product => product.name.split(" ")[0]))];
    brandFilter.replaceChildren();
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All brands";
    brandFilter.append(allOption);
    brands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandFilter.append(option);
    });

    function drawProducts() {
        container.replaceChildren();
        const filtered = brandFilter.value === "all"
            ? products
            : products.filter(product => product.name.startsWith(brandFilter.value));

        filtered.forEach(product => {
            const card = document.createElement("article");
            card.className = "option-card";
            const isSelected = selectedComponents[activeCategory]?.id === product.id;
            card.classList.toggle("selected", isSelected);
            card.classList.toggle("incompatible", compatibilityWarnings(activeCategory, product).length > 0);

            const imageBox = document.createElement("div");
            imageBox.className = "option-image";
            if (product.image) {
                const image = document.createElement("img");
                image.src = product.image;
                image.alt = "";
                image.loading = "lazy";
                image.referrerPolicy = "no-referrer";
                image.addEventListener("error", () => {
                    image.remove();
                    imageBox.textContent = activeCategory.slice(0, 3).toUpperCase();
                }, { once: true });
                imageBox.append(image);
            } else {
                imageBox.textContent = activeCategory.slice(0, 3).toUpperCase();
            }

            const details = document.createElement("div");
            details.className = "option-details";
            const name = document.createElement("strong");
            name.textContent = product.name;
            const specs = document.createElement("p");
            specs.textContent = product.specs.join(" · ");
            const meta = document.createElement("div");
            meta.className = "option-meta";
            const stock = document.createElement("span");
            stock.className = product.stock <= 6 ? "stock-badge low" : "stock-badge";
            stock.textContent = product.stock <= 6 ? "Low stock" : `${product.stock} in stock`;
            const price = document.createElement("strong");
            price.className = "option-price";
            price.textContent = formatPrice(product.price);
            meta.append(stock, price);
            details.append(name, specs, meta);

            const selectButton = document.createElement("button");
            selectButton.type = "button";
            selectButton.className = "select-option";
            selectButton.textContent = isSelected ? "Selected" : "Select";
            selectButton.setAttribute("aria-pressed", String(isSelected));
            selectButton.addEventListener("click", () => {
                selectedComponents[activeCategory] = product;
                purchaseError = "";
                render();
            });

            card.append(imageBox, details, selectButton);
            const warnings = compatibilityWarnings(activeCategory, product);
            if (warnings.length) {
                const warning = document.createElement("p");
                warning.className = "compatibility-warning option-warning";
                warning.textContent = `ⓘ ${warnings[0]}`;
                card.append(warning);
            }
            container.append(card);
        });
    }

    brandFilter.onchange = drawProducts;
    drawProducts();
}

function renderBuildOverview() {
    const config = document.getElementById("build-config");
    config.replaceChildren();
    categoryOrder.forEach(category => {
        const selected = selectedComponents[category];
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "config-tile";
        tile.classList.toggle("empty", !selected);
        tile.classList.toggle("has-warning", getWarningsForSelection(category).length > 0);
        tile.addEventListener("click", () => {
            activeCategory = category;
            activeTab = addonCategories.includes(category) ? "addons" : "base";
            setActiveTab(activeTab);
        });

        const label = document.createElement("span");
        label.className = "config-label";
        label.textContent = category;
        const value = document.createElement("strong");
        value.textContent = selected ? selected.name : "Choose a component";
        tile.append(label, value);

        const warnings = getWarningsForSelection(category);
        if (warnings.length) {
            const note = document.createElement("small");
            note.className = "compatibility-warning";
            note.textContent = `ⓘ ${warnings[0]}`;
            tile.append(note);
        }
        config.append(tile);
    });
}

function renderSummary() {
    const list = document.getElementById("summary-list");
    list.replaceChildren();
    categoryOrder.forEach(category => {
        const product = selectedComponents[category];
        const row = document.createElement("button");
        row.type = "button";
        row.className = "summary-row";
        row.addEventListener("click", () => {
            activeCategory = category;
            activeTab = addonCategories.includes(category) ? "addons" : "base";
            document.getElementById("build-summary-dialog").close();
            setActiveTab(activeTab);
        });
        const label = document.createElement("span");
        label.textContent = category;
        const value = document.createElement("strong");
        value.textContent = product ? product.name : "Not selected";
        const price = document.createElement("span");
        price.textContent = product ? formatPrice(product.price) : "—";
        row.append(label, value, price);
        list.append(row);
    });
}

function openBuildSummary() {
    renderSummary();
    renderTotals();
    const dialog = document.getElementById("build-summary-dialog");
    if (!dialog.open) dialog.showModal();
    document.querySelectorAll(".picker-tab").forEach(tab => {
        const active = tab.dataset.tab === "summary";
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
    });
}

function getPurchaseDate(purchase) {
    const value = purchase.created_at || purchase.purchased_at || purchase.timestamp || purchase.date;
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function describePurchaseItems(purchase) {
    const items = Array.isArray(purchase.items) ? purchase.items : [];
    if (items.length) return items.map(item => typeof item === "string" ? item : item.name || item.product_name || item.product || item.id).filter(Boolean);
    const singleItem = purchase.product_name || purchase.product || purchase.name || purchase.item;
    return singleItem ? [typeof singleItem === "string" ? singleItem : singleItem.name || "Purchase"] : [];
}

function renderPurchases(purchases, note = "") {
    const list = document.getElementById("purchase-list");
    list.replaceChildren();
    if (note) {
        const status = document.createElement("p");
        status.className = "purchase-fetch-status";
        status.textContent = note;
        list.append(status);
    }
    if (!purchases.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = note.startsWith("Could not load")
            ? "Check your connection and use Refresh to try again."
            : note ? "Your order will appear here once processing is complete." : "No purchases have been recorded yet.";
        list.append(empty);
        return;
    }

    purchases.forEach((purchase, index) => {
        const card = document.createElement("article");
        card.className = "purchase-record";
        const heading = document.createElement("div");
        heading.className = "purchase-record-heading";
        const title = document.createElement("strong");
        title.textContent = purchase.order_id || purchase.purchase_id || `Purchase ${index + 1}`;
        const date = document.createElement("time");
        const dateValue = getPurchaseDate(purchase);
        date.textContent = dateValue
            ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(dateValue)
            : "Date unavailable";
        heading.append(title, date);

        const items = document.createElement("p");
        items.className = "purchase-record-items";
        items.textContent = describePurchaseItems(purchase).join(" · ") || "Order details unavailable";

        const amount = document.createElement("strong");
        amount.className = "purchase-record-total";
        const total = purchase.total ?? purchase.total_amount ?? purchase.amount ?? purchase.price;
        amount.textContent = total == null ? "Total unavailable" : `${purchase.currency || "USD"} ${Number(total).toFixed(2)}`;

        card.append(heading, items, amount);
        list.append(card);
    });
}

async function refreshPurchases(expectedCreatedAt = null) {
    const list = document.getElementById("purchase-list");
    list.replaceChildren();
    const loading = document.createElement("p");
    loading.className = "empty-state";
    loading.textContent = expectedCreatedAt ? "Order accepted. Waiting for it to be saved…" : "Loading purchases…";
    list.append(loading);

    try {
        let purchases = [];
        for (let attempt = 0; attempt < (expectedCreatedAt ? 6 : 1); attempt += 1) {
            const response = await fetch(`${apiBaseUrl}/purchases`, { headers: { Accept: "application/json" } });
            if (!response.ok) throw new Error(`Purchase history returned ${response.status}.`);
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Purchase history has an unexpected format.");
            purchases = data.sort((a, b) => (getPurchaseDate(b)?.getTime() || 0) - (getPurchaseDate(a)?.getTime() || 0));
            const orderAppeared = expectedCreatedAt && purchases.some(purchase => purchase.created_at === expectedCreatedAt);
            renderPurchases(purchases.slice(0, 10), expectedCreatedAt && !orderAppeared ? "Order accepted. Waiting for it to be saved…" : "");
            if (!expectedCreatedAt || orderAppeared) return;
            if (attempt < 5) await new Promise(resolve => window.setTimeout(resolve, 900));
        }
        renderPurchases(purchases.slice(0, 10), expectedCreatedAt ? "Your order was accepted and is still processing." : "");
    } catch (error) {
        renderPurchases([], `Could not load purchase history: ${error.message}`);
    }
}

async function submitPurchase() {
    const button = document.getElementById("purchase-button");
    if (button.disabled || purchaseInFlight) return;
    purchaseInFlight = true;
    purchaseError = "";
    renderTotals();
    const createdAt = new Date().toISOString();
    const items = categoryOrder.map(category => {
        const product = selectedComponents[category];
        return { category, id: product.id, name: product.name, price: Number(product.price), quantity: 1 };
    });
    const total = items.reduce((sum, item) => sum + item.price, 0);
    const estimatedPower = Object.values(selectedComponents).reduce(
        (sum, product) => sum + Number(product.tdp || product.power || 0), 0
    );
    const purchase = {
        order_id: `PCF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        created_at: createdAt,
        currency: "USD",
        items,
        total: Number(total.toFixed(2)),
        estimated_power_w: estimatedPower
    };

    button.disabled = true;
    button.textContent = "Submitting…";
    try {
        const response = await fetch(`${apiBaseUrl}/buy`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(purchase)
        });
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `Purchase request returned ${response.status}.`);
        }
        const historyDialog = document.getElementById("purchases-dialog");
        document.getElementById("build-summary-dialog").close();
        if (!historyDialog.open) historyDialog.showModal();
        await refreshPurchases(createdAt);
    } catch (error) {
        purchaseError = `Could not submit your order: ${error.message}`;
    } finally {
        purchaseInFlight = false;
        button.textContent = "Place order";
        renderTotals();
    }
}

function renderTotals() {
    const products = Object.values(selectedComponents);
    const price = products.reduce((sum, product) => sum + Number(product.price), 0);
    const watts = products.reduce((sum, product) => sum + Number(product.tdp || product.power || 0), 0);
    document.getElementById("total-price").textContent = formatPrice(price);
    document.getElementById("summary-price").textContent = formatPrice(price);
    document.getElementById("estimated-power").textContent = `${watts} W`;
    document.getElementById("selected-count").textContent = `${products.length} / ${categoryOrder.length}`;
    const missing = categoryOrder.filter(category => !selectedComponents[category]);
    const issues = [...new Set(categoryOrder.flatMap(category => getWarningsForSelection(category)))];
    const validation = document.getElementById("purchase-validation");
    const purchaseButton = document.getElementById("purchase-button");
    if (purchaseError) {
        validation.textContent = purchaseError;
    } else if (missing.length) {
        validation.textContent = `Select all components to continue. Still needed: ${missing.join(", ")}.`;
    } else if (issues.length) {
        validation.textContent = `Fix compatibility issues before purchasing: ${issues.join(" ")}`;
    } else {
        validation.textContent = "Your build is complete and compatible.";
    }
    validation.classList.toggle("is-ready", !purchaseError && !missing.length && !issues.length);
    purchaseButton.disabled = purchaseInFlight || Boolean(missing.length || issues.length);
}

function updateCasePreview() {
    const preview = document.getElementById("case-preview");
    const fallback = document.querySelector(".case-fallback");
    const selectedCase = selectedComponents.Case;
    if (!selectedCase?.image) {
        preview.hidden = true;
        fallback.hidden = false;
        return;
    }
    preview.hidden = false;
    fallback.hidden = true;
    preview.src = selectedCase.image;
    preview.alt = `${selectedCase.name} PC case`;
    document.querySelectorAll(".stage-dots button").forEach(dot => {
        dot.classList.toggle("active", dot.dataset.caseId === selectedCase.id);
    });
}

function render() {
    document.querySelectorAll(".picker-tab").forEach(tab => {
        const active = tab.dataset.tab === activeTab;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
    });
    if (!activeCategories().includes(activeCategory)) activeCategory = activeCategories()[0];
    renderCategoryNavigation();
    renderProductOptions();
    renderBuildOverview();
    renderSummary();
    renderTotals();
    updateCasePreview();
}

function setActiveTab(tab) {
    activeTab = tab;
    render();
}

document.querySelectorAll(".picker-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        if (tab.dataset.tab === "summary") openBuildSummary();
        else setActiveTab(tab.dataset.tab);
    });
});

document.getElementById("next-step").addEventListener("click", openBuildSummary);
document.getElementById("purchase-button").addEventListener("click", submitPurchase);
document.getElementById("open-purchases").addEventListener("click", () => {
    const dialog = document.getElementById("purchases-dialog");
    if (!dialog.open) dialog.showModal();
    refreshPurchases();
});
document.getElementById("refresh-purchases").addEventListener("click", () => refreshPurchases());
document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => document.getElementById(button.dataset.close).close());
});
document.querySelectorAll(".overlay-dialog").forEach(dialog => {
    dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
    });
    if (dialog.id === "build-summary-dialog") dialog.addEventListener("close", render);
});

function selectAdjacentCase(direction) {
    const cases = componentData.Case;
    const currentIndex = Math.max(0, cases.findIndex(pcCase => pcCase.id === selectedComponents.Case?.id));
    const nextIndex = (currentIndex + direction + cases.length) % cases.length;
    selectedComponents.Case = cases[nextIndex];
    render();
}
document.querySelector(".stage-arrow.previous").addEventListener("click", () => selectAdjacentCase(-1));
document.querySelector(".stage-arrow.next").addEventListener("click", () => selectAdjacentCase(1));
document.querySelectorAll(".stage-dots button").forEach(dot => {
    dot.addEventListener("click", () => {
        selectedComponents.Case = getProduct("Case", dot.dataset.caseId);
        render();
    });
});
document.getElementById("restart-build").addEventListener("click", () => {
    Object.keys(selectedComponents).forEach(category => delete selectedComponents[category]);
    purchaseError = "";
    activeTab = "base";
    activeCategory = "CPU";
    render();
});

document.getElementById("toggle-performance").addEventListener("click", event => {
    const details = document.getElementById("performance-details");
    details.hidden = !details.hidden;
    event.currentTarget.setAttribute("aria-expanded", String(!details.hidden));
    event.currentTarget.textContent = details.hidden ? "⌄" : "⌃";
});

document.getElementById("share-build").addEventListener("click", async event => {
    const buildText = categoryOrder
        .map(category => selectedComponents[category] ? `${category}: ${selectedComponents[category].name}` : null)
        .filter(Boolean)
        .join("\n");
    try {
        await navigator.clipboard.writeText(buildText || "My PCForge build is just getting started.");
        event.currentTarget.textContent = "Copied";
        window.setTimeout(() => { event.currentTarget.textContent = "Share"; }, 1500);
    } catch {
        event.currentTarget.textContent = "Select and copy your build";
        window.setTimeout(() => { event.currentTarget.textContent = "Share"; }, 1800);
    }
});

document.getElementById("case-preview").addEventListener("error", () => {
    document.getElementById("case-preview").hidden = true;
    document.querySelector(".case-fallback").hidden = false;
}, { once: true });

render();
