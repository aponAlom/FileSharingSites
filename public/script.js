// ===============================
// SEND FILES
// ===============================
function sendFile() {

    const fileInput = document.getElementById("sendFile");
    const keywordInput = document.getElementById("sendKey");

    const files = fileInput.files;
    const keyword = keywordInput.value.trim();

    if (files.length === 0) {
        alert("Please select at least one file");
        return;
    }

    if (keyword === "") {
        alert("Please enter a keyword");
        return;
    }

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    formData.append("keyword", keyword);

    fetch("/upload", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        fileInput.value = "";
        keywordInput.value = "";
    })
    .catch(() => alert("Upload failed"));
}

// ===============================
// RECEIVE ZIP
// ===============================
function receiveFile() {

    const receiveKeyInput = document.getElementById("receiveKey");
    const keyword = receiveKeyInput.value.trim();

    if (keyword === "") {
        alert("Please enter keyword");
        return;
    }

    fetch(`/download/${keyword}`)
        .then(res => {
            if (!res.ok) throw new Error("File expired or not found");
            return res.blob();
        })
        .then(blob => {

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `${keyword}.zip`; // ZIP name
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            alert("ZIP downloaded successfully");
            receiveKeyInput.value = "";
        })
        .catch(err => alert(err.message));
}
