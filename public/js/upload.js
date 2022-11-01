form.addEventListener("submit", () => {
    const upload = {
        image: image.value,
        des_name: des_name.value,
        cost: cost.value,

    }
    fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify(upload),
        headers: {
            "Content-Type": "application/json"
        }
    })
})