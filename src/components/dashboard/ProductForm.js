import React, { useState, useEffect } from "react";

export default function ProductForm({
    product,
    onSubmit,
    onCancel,
    loading,
    themeColor,
}) {
    const [form, setForm] = useState({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price || "",
        quantity: product?.quantity || "",
        category: product?.category || "",
        subCategory: product?.subCategory || "",
        sizes: Array.isArray(product?.sizes)
            ? product.sizes.join(",")
            : product?.sizes || "",
        colors: Array.isArray(product?.colors)
            ? product.colors.join(",")
            : product?.colors || "",
        image: null, // file
    });

    useEffect(() => {
        setForm({
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || "",
            quantity: product?.quantity || "",
            category: product?.category || "",
            subCategory: product?.subCategory || "",
            sizes: Array.isArray(product?.sizes)
                ? product.sizes.join(",")
                : product?.sizes || "",
            colors: Array.isArray(product?.colors)
                ? product.colors.join(",")
                : product?.colors || "",
            image: null,
        });
    }, [product]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        setForm((prev) => ({
            ...prev,
            image: file,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple client-side validation
        if (!form.name.trim()) return alert("Product name is required");
        if (!form.price) return alert("Price is required");
        if (!form.quantity) return alert("Quantity is required");

        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("price", form.price);
        fd.append("quantity", form.quantity);
        fd.append("category", form.category || "");
        fd.append("subCategory", form.subCategory || "");
        fd.append("sizes", form.sizes || "");
        fd.append("colors", form.colors || "");
        if (form.image) fd.append("image", form.image);

        onSubmit(fd);
    };

    return (
        <div
            className="modal d-block bg-dark bg-opacity-50"
            tabIndex="-1"
            onClick={onCancel}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-light">
                        <h5 className="modal-title fw-bold">
                            {product ? "Edit Product" : "Add New Product"}
                        </h5>
                        <button className="btn-close" onClick={onCancel}></button>
                    </div>

                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Price *</label>
                                    <div className="input-group">
                                        <span className="input-group-text">$</span>
                                        <input
                                            type="number"
                                            name="price"
                                            className="form-control"
                                            value={form.price}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Quantity *</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        className="form-control"
                                        value={form.quantity}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="3"
                                    value={form.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Category</label>
                                    <input
                                        name="category"
                                        className="form-control"
                                        value={form.category}
                                        onChange={handleChange}
                                        placeholder="e.g., Clothing"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Sub Category</label>
                                    <input
                                        name="subCategory"
                                        className="form-control"
                                        value={form.subCategory}
                                        onChange={handleChange}
                                        placeholder="e.g., Women's Saree"
                                    />
                                </div>
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        Sizes (comma separated)
                                    </label>
                                    <input
                                        name="sizes"
                                        className="form-control"
                                        value={form.sizes}
                                        onChange={handleChange}
                                        placeholder="S, M, L, XL"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        Colors (comma separated)
                                    </label>
                                    <input
                                        name="colors"
                                        className="form-control"
                                        value={form.colors}
                                        onChange={handleChange}
                                        placeholder="Red, Blue, Black"
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Main Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    className="form-control"
                                    onChange={handleFile}
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary text-white"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            />
                                            Saving...
                                        </>
                                    ) : product ? (
                                        "Update Product"
                                    ) : (
                                        "Create Product"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ImagePreview({ file, existingUrl, size = 90 }) {
    const [preview, setPreview] = useState(null);
    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);
    const src = preview || existingUrl;
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: 10,
                overflow: "hidden",
                background: "#f5f6fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #eee",
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            ) : (
                <span style={{ fontSize: 32 }}>📦</span>
            )}
        </div>
    );
}

export const formatArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
};

export const cleanString = (v) => (v ? String(v).trim() : "");

export const validateProduct = (form) => {
    if (!cleanString(form.name)) return "Product name is required";
    if (!form.price) return "Price is required";
    if (isNaN(form.price)) return "Price must be a number";
    if (!form.quantity) return "Quantity is required";
    return null;
};
