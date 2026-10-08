"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const products = [
  "Verinice Combo ( Oil & Tablet )",
  "Verinice Tel (Oil)",
  "Prostcal Tablet",
  "UroHarsh Tablets",
  "Fungitch Tablets",
  "Thyset Tablets",
  "ViroHarsh Tablets",
  "CalHarsh Tablets",
  "ImuHarsh Tablets",
  "Rumayu Tablets",
  "Disaharsh Tablet",
  "Paraharsh Tablets",
  "Verinice Tablet",
  "Hanspathyadi Tablets",
  "Harshmeha Tablet",
  "Pancham Tel",
  "Harshmeha Churna",
  "Suhrud Tablet",
];

// Recommended limits for Apps Script + Base64
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20 MB

export default function HomePage() {
  const router = useRouter();

  const [images, setImages] = useState([
    { id: Date.now() },
  ]);

  const [videos, setVideos] = useState([
    { id: Date.now() + 1 },
  ]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    product: "",
    feedback: "",
  });

  const [selectedImages, setSelectedImages] = useState({});
  const [selectedVideos, setSelectedVideos] = useState({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function addImageField() {
    setImages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
      },
    ]);
  }

  function removeImageField(id) {
    setImages((prev) =>
      prev.filter((item) => item.id !== id)
    );

    setSelectedImages((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }

  function addVideoField() {
    setVideos((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
      },
    ]);
  }

  function removeVideoField(id) {
    setVideos((prev) =>
      prev.filter((item) => item.id !== id)
    );

    setSelectedVideos((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }

  function handleImageChange(id, file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image size cannot exceed 10 MB.");
      return;
    }

    setSelectedImages((prev) => ({
      ...prev,
      [id]: file,
    }));
  }

  function handleVideoChange(id, file) {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file.");
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      alert("Video size cannot exceed 20 MB.");
      return;
    }

    setSelectedVideos((prev) => ({
      ...prev,
      [id]: file,
    }));
  }

 function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (!result) {
        reject(
          new Error(
            "Could not read the file."
          )
        );
        return;
      }

      const base64 =
        result.split(",")[1];

      if (!base64) {
        reject(
          new Error(
            "Could not convert file to Base64."
          )
        );
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => {
      reject(
        new Error(
          "Error reading file."
        )
      );
    };

    reader.readAsDataURL(file);
  });
}

 async function uploadFileToAppsScript(file, type) {
  console.log("Uploading:", file.name);
  console.log("Size:", file.size);
  console.log("Type:", file.type);

  const base64 = await fileToBase64(file);

  console.log(
    "Base64 generated:",
    base64.length
  );

  const data = new FormData();

  data.append("action", "uploadFile");
  data.append("fileName", file.name);
  data.append(
    "mimeType",
    file.type || "application/octet-stream"
  );
  data.append("fileType", type);
  data.append("fileData", base64);

  const response = await fetch(
    "/api/feedback",
    {
      method: "POST",
      body: data,
    }
  );

  const result = await response.json();

  console.log(
    "Upload response:",
    result
  );

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "File upload failed."
    );
  }

  if (!result.fileUrl) {
    throw new Error(
      "File uploaded but Drive URL was not returned."
    );
  }

  return result.fileUrl;
}

  async function submitFeedback(e) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const imageFiles =
        Object.values(selectedImages).filter(Boolean);

      const videoFiles =
        Object.values(selectedVideos).filter(Boolean);

      const imageLinks = [];
      const videoLinks = [];

      /*
       * Upload images one by one
       */
      for (const file of imageFiles) {
        const url = await uploadFileToAppsScript(
          file,
          "image"
        );

        imageLinks.push(url);
      }

      /*
       * Upload videos one by one
       */
      for (const file of videoFiles) {
        const url = await uploadFileToAppsScript(
          file,
          "video"
        );

        videoLinks.push(url);
      }

      /*
       * Save feedback + Drive links
       */
      const data = new FormData();

data.append(
  "action",
  "submitFeedback"
);

data.append("name", form.name);
data.append("email", form.email);
data.append("mobile", form.mobile);
data.append("product", form.product);
data.append("feedback", form.feedback);

data.append(
  "imageLinks",
  imageLinks.join("\n")
);

data.append(
  "videoLinks",
  videoLinks.join("\n")
);
      const response = await fetch("/api/feedback", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Could not submit feedback."
        );
      }

      router.push("/success");

    } catch (error) {
      console.error(
        "Feedback submission error:",
        error
      );

      setMessage(
        error.message ||
          "Something went wrong while submitting feedback."
      );

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#198754]" />

            <h4 className="text-lg font-semibold">
              Submitting your feedback...
            </h4>

            <p className="mt-2 text-gray-500">
              Please wait while we upload your files.
            </p>
          </div>
        </div>
      )}

      <main className="min-h-screen px-0 py-1">
        <div className="feedback-card">

          <img
            src="/logo.png"
            alt="Harsh Products"
            className="logo"
          />

          <h1 className="section-title">
            Customer Feedback Form
          </h1>

          <p className="section-subtitle">
            Thank you for choosing Harsh Products.
            Your valuable feedback helps us improve
            our products and services.
          </p>

          <form onSubmit={submitFeedback}>

            {/* NAME */}

            <div className="mb-4">
              <label className="form-label-custom mb-2 block">
                Full Name
              </label>

              <div className="flex">
                <span className="input-icon flex items-center justify-center rounded-l-[10px] px-3">
                  <i className="bi bi-person-fill" />
                </span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* EMAIL */}

            <div className="mb-4">
              <label className="form-label-custom mb-2 block">
                Email
              </label>

              <div className="flex">
                <span className="input-icon flex items-center justify-center rounded-l-[10px] px-3">
                  <i className="bi bi-envelope-fill" />
                </span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* MOBILE */}

            <div className="mb-4">
              <label className="form-label-custom mb-2 block">
                Mobile Number
              </label>

              <div className="flex">
                <span className="input-icon flex items-center justify-center rounded-l-[10px] px-3">
                  <i className="bi bi-phone-fill" />
                </span>

                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* PRODUCT */}

            <div className="mb-4">
              <label className="form-label-custom mb-2 block">
                Product
              </label>

              <div className="flex">
                <span className="input-icon flex items-center justify-center rounded-l-[10px] px-3">
                  <i className="bi bi-box-seam-fill" />
                </span>

                <select
                  name="product"
                  value={form.product}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">
                    Select Product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product}
                      value={product}
                    >
                      {product}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FEEDBACK */}

            <div className="mb-5">
              <label className="form-label-custom mb-2 block">
                Your Feedback
              </label>

              <textarea
                name="feedback"
                value={form.feedback}
                onChange={handleChange}
                placeholder="Write your feedback here..."
                rows="5"
                className="form-input"
                required
              />
            </div>

            {/* IMAGES */}

            <div className="mb-5">
              <div className="upload-title">
                <i className="bi bi-images mr-1" />
                Upload Images
              </div>

              {images.map((item, index) => (
                <div
                  className="file-row"
                  key={item.id}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                    onChange={(e) =>
                      handleImageChange(
                        item.id,
                        e.target.files?.[0]
                      )
                    }
                  />

                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={addImageField}
                      className="add-btn bg-[#198754] text-white hover:bg-[#157347]"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        removeImageField(item.id)
                      }
                      className="add-btn bg-red-500 text-white hover:bg-red-600"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* VIDEOS */}

            <div className="mb-5">
              <div className="upload-title">
                <i className="bi bi-camera-video-fill mr-1" />
                Upload Videos
              </div>

              {videos.map((item, index) => (
                <div
                  className="file-row"
                  key={item.id}
                >
                  <input
                    type="file"
                    accept="video/*"
                    className="file-input"
                    onChange={(e) =>
                      handleVideoChange(
                        item.id,
                        e.target.files?.[0]
                      )
                    }
                  />

                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={addVideoField}
                      className="add-btn bg-[#198754] text-white hover:bg-[#157347]"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        removeVideoField(item.id)
                      }
                      className="add-btn bg-red-500 text-white hover:bg-red-600"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  )}
                </div>
              ))}

              
            </div>

            {/* ERROR */}

            {message && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-red-600">
                {message}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="submit-btn bg-[#198754] text-white transition hover:bg-[#157347] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <i className="bi bi-send-fill mr-2" />

              {loading
                ? "Submitting..."
                : "Submit Feedback"}
            </button>
          </form>

          <div className="footer-note">
            ❤️ Thank you for trusting Harsh Products.
          </div>

        </div>
      </main>
    </>
  );
}