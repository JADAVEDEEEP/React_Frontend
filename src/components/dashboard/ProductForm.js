import React, { useState, useEffect } from "react";
import { GiTShirt } from "react-icons/gi";
export default function ProductForm({
    product,
    onSubmit,
    onCancel,
    loading,
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
        image: null,
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
            <style>
                {`
                  .card-section {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    padding: 18px 20px;
                    border-radius: 16px;
                    margin-bottom: 18px;
                  }

                  .section-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 14px;
                    color: #1f2937;
                  }

                  .input-box {
                    border-radius: 12px !important;
                    padding: 10px 14px !important;
                    border: 1px solid #d1d5db !important;
                    font-size: 15px !important;
                  }

                  .image-upload-box {
                    border: 1.5px dashed #cbd5e1;
                    border-radius: 14px;
                    height: 160px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #f8fafc;
                    color: #94a3b8;
                    cursor: pointer;
                  }
                `}
            </style>

            <div
                className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content border-0 rounded-4 shadow-lg">

                    {/* HEADER */}
                    <div className="modal-header bg-light rounded-top-4">
                        <h5 className="modal-title fw-bold">
                            {product ? "Edit Product" : "Add New Product"}
                        </h5>
                        <button className="btn-close" onClick={onCancel}></button>
                    </div>

                    {/* BODY */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>

                            <div className="row g-4">

                                {/* LEFT SIDE */}
                                <div className="col-md-7">

                                    {/* GENERAL INFO */}
                                    <div className="card-section">
                                        <div className="section-title">General Information</div>

                                        <label className="fw-semibold">Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control input-box mb-3"
                                            value={form.name}
                                            onChange={handleChange}
                                        />

                                        <label className="fw-semibold">Description</label>
                                        <textarea
                                            name="description"
                                            rows="4"
                                            className="form-control input-box"
                                            value={form.description}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>

                                    {/* PRICING */}
                                    <div className="card-section">
                                        <div className="section-title">Pricing</div>

                                        <label className="fw-semibold">Price *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            className="form-control input-box"
                                            value={form.price}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* INVENTORY */}
                                    <div className="card-section">
                                        <div className="section-title">Inventory</div>

                                        <label className="fw-semibold">Quantity *</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            className="form-control input-box mb-3"
                                            value={form.quantity}
                                            onChange={handleChange}
                                        />

                                        <label className="fw-semibold">Sizes (comma separated)</label>
                                        <input
                                            name="sizes"
                                            className="form-control input-box mb-3"
                                            value={form.sizes}
                                            onChange={handleChange}
                                        />

                                        <label className="fw-semibold">Colors (comma separated)</label>
                                        <input
                                            name="colors"
                                            className="form-control input-box"
                                            value={form.colors}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* RIGHT SIDE */}
                                <div className="col-md-5">

                                    {/* PRODUCT MEDIA */}
                                    <div className="card-section">
                                        <div className="section-title">Product Media</div>

                                        <label className="fw-semibold">Main Image</label>

                                        <div className="image-upload-box mb-3">
                                            {form.image ? (
                                                <img
                                                    src={URL.createObjectURL(form.image)}
                                                    alt="Preview"
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        borderRadius: "12px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                "Click to upload"
                                            )}
                                        </div>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="form-control input-box"
                                            onChange={handleFile}
                                        />
                                    </div>

                                    {/* CATEGORY */}
                                    <div className="card-section">
                                        <div className="section-title">Category</div>

                                        <label className="fw-semibold">Category</label>
                                        <input
                                            name="category"
                                            className="form-control input-box mb-3"
                                            value={form.category}
                                            onChange={handleChange}
                                        />

                                        <label className="fw-semibold">Sub Category</label>
                                        <input
                                            name="subCategory"
                                            className="form-control input-box"
                                            value={form.subCategory}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* BUTTONS */}
                            <div className="d-flex justify-content-end gap-3 mt-4">
                               <button
    type="submit"
    disabled={loading}
    style={{
        padding: "8px 18px",
        borderRadius: "40px",
        border: "1.8px solid #d0d0d0",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        transition: "0.2s",
        fontSize: "14px",
        color: "#1a2b3d",
        fontWeight: 600,
    }}
    onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "scale(1.04)")
    }
    onMouseLeave={(e) =>
        (e.currentTarget.style.transform = "scale(1)")
    }
>
    {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
    <GiTShirt size={18} color="#1a2b3d" />
</button>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
