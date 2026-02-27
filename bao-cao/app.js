let accessToken = null;

function initClient() {
  gapi.load('client', async () => {
    await gapi.client.init({
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    });
  });
}

function authenticate() {
  return new Promise((resolve) => {
    google.accounts.oauth2.initTokenClient({
      client_id: 584362745526-feuji1iltb3ui3gaoaiob0njmt9s6e31.apps.googleusercontent.com,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (tokenResponse) => {
        accessToken = tokenResponse.access_token;
        gapi.client.setToken({ access_token: accessToken });
        resolve();
      },
    }).requestAccessToken();
  });
}

async function uploadFile(file, newFileName) {
  const metadata = {
    name: newFileName,
    parents: [1zo5itRH_OZ50srEO7tifsW02RwmxIQUU]
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart");
  xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

  xhr.upload.onprogress = function (e) {
    const percent = Math.round((e.loaded / e.total) * 100);
    const bar = document.getElementById("progressBar");
    bar.style.width = percent + "%";
    bar.innerText = percent + "%";
  };

  return new Promise((resolve, reject) => {
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = reject;
    xhr.send(form);
  });
}

async function submitForm() {

  const nhanSu = document.getElementById("nhanSu").value;
  const ngayChiaSe = document.getElementById("ngayChiaSe").value;
  const noiDungChinh = document.getElementById("noiDungChinh").value;
  const file = document.getElementById("fileInput").files[0];

  if (!nhanSu || !ngayChiaSe || !file) {
    alert("Thiếu thông tin");
    return;
  }

  await authenticate();

  const timestamp = Date.now();
  const newFileName = `${nhanSu}_${ngayChiaSe}_${timestamp}`;

  const uploaded = await uploadFile(file, newFileName);

  const fileLink = `https://drive.google.com/file/d/${uploaded.id}/view`;

  const payload = {
    pbc1: "Default",
    pbc2: "Default",
    nhanSu,
    ngayChiaSe,
    noiDungChinh,
    fileName: newFileName,
    fileLink,
    fileSize: file.size
  };

  const res = await fetch(https://script.google.com/macros/s/AKfycbxuuHbYIwaO4RN40xM8HMVjBduSMls_NrXPvSINLr956ns1qQYOFQo4ETH84m6r-4YoSw/exec, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const result = await res.json();

  if (result.status === "duplicate") {
    alert("Báo cáo đã tồn tại!");
  } else if (result.status === "success") {
    alert("Gửi thành công!");
    location.reload();
  } else {
    alert("Có lỗi xảy ra");
  }
}

initClient();
