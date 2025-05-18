
const accessKey = "RZEIOVfPhS7vMLkFdd2TSKGFBS4o9_FmcV1Nje3FSjw";

// DOM Elements
const searchFormEl = document.getElementById("search-form");
const searchInputEl = document.getElementById("search-input");
const searchButtonEl = document.getElementById("search-button");
const searchResultsEl = document.querySelector(".search-results");
const showMoreButtonEl = document.getElementById("show-more-button");
const logoutButton = document.getElementById("logout-button");
const loginContainer = document.getElementById("login-container");
const appContainer = document.getElementById("app-container");
const loginFormEl = document.getElementById("login-form");

let inputData = "";
let page = 1;

// ======= AUTHENTICATION LOGIC =======
loginFormEl.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email === "user@gmail.com" && password === "123456") {
        localStorage.setItem("isAuthenticated", "true");
        checkAuth();
    } else {
        alert("Invalid credentials. Try again!");
    }
});

function checkAuth() {
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (isAuthenticated === "true") {
        loginContainer.style.display = "none";
        appContainer.style.display = "block";
        logoutButton.style.display = "block";
        loadRecommendedImages();
    } else {
        loginContainer.style.display = "block";
        appContainer.style.display = "none";
        logoutButton.style.display = "none";
    }
}

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("isAuthenticated");
    checkAuth();
    searchResultsEl.innerHTML = "";
    searchInputEl.value = "";
    page = 1;
});

// ======= IMAGE SEARCH LOGIC =======
async function loadRecommendedImages() {
    const url = `https://api.unsplash.com/photos/random?count=6&client_id=${accessKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        searchResultsEl.innerHTML = "";
        data.forEach((result) => {
            createImageCard(result);
        });

        showMoreButtonEl.style.display = "none";
    } catch (error) {
        console.error("Error loading recommended images:", error);
    }
}

async function searchImages() {
    inputData = searchInputEl.value.trim();
    
    if (!inputData) {
        searchResultsEl.innerHTML = "<p>Please enter a search term</p>";
        showMoreButtonEl.style.display = "none";
        return;
    }

    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${inputData}&client_id=${accessKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (page === 1) {
            searchResultsEl.innerHTML = "";
        }

        if (data.results && data.results.length > 0) {
            data.results.forEach((result) => {
                createImageCard(result);
            });

            page++;
            showMoreButtonEl.style.display = "block";
        } else {
            searchResultsEl.innerHTML = "<p>No results found. Try a different search term.</p>";
            showMoreButtonEl.style.display = "none";
        }
    } catch (error) {
        console.error("Error searching images:", error);
        searchResultsEl.innerHTML = "<p>Error fetching images. Please try again.</p>";
        showMoreButtonEl.style.display = "none";
    }
}

function createImageCard(result) {
    const imageWrapper = document.createElement("div");
    imageWrapper.classList.add("search-result");

    const image = document.createElement("img");
    image.src = result.urls.small;
    image.alt = result.alt_description || "Unsplash image";

    const imageLink = document.createElement("a");
    imageLink.href = result.links.html;
    imageLink.target = "_blank";
    imageLink.textContent = result.alt_description || "View Image";

    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download";
    downloadButton.classList.add("download-btn");

    downloadButton.addEventListener("click", (e) => {
        e.stopPropagation();
        showConfirmationDialog(result.urls.full);
    });

    imageWrapper.appendChild(image);
    imageWrapper.appendChild(imageLink);
    imageWrapper.appendChild(downloadButton);
    searchResultsEl.appendChild(imageWrapper);
}

function showConfirmationDialog(imageURL) {
    const confirmationBox = document.createElement("div");
    confirmationBox.classList.add("confirmation-box");

    confirmationBox.innerHTML = `
        <p>Do you want to download this image?</p>
        <button class="confirm-yes">Yes</button>
        <button class="confirm-no">Cancel</button>
    `;

    document.body.appendChild(confirmationBox);

    document.querySelector(".confirm-yes").addEventListener("click", async () => {
        await downloadImage(imageURL);
        document.body.removeChild(confirmationBox);
    });

    document.querySelector(".confirm-no").addEventListener("click", () => {
        document.body.removeChild(confirmationBox);
    });
}

async function downloadImage(imageURL) {
    try {
        const response = await fetch(imageURL, { cache: "no-cache" });
        const blob = await response.blob();
        const blobURL = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobURL;
        link.download = `image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobURL);
        }, 1000);
    } catch (error) {
        console.error("Download failed:", error);
        alert("Download failed. Please try again.");
    }
}

// Event Listeners
searchFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    page = 1;
    searchImages();
});

searchButtonEl.addEventListener("click", (e) => {
    e.preventDefault();
    page = 1;
    searchImages();
});

showMoreButtonEl.addEventListener("click", () => {
    searchImages();
});

// Initialize the app
checkAuth();