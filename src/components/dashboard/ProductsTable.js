import React from "react";
import { GiTShirt } from "react-icons/gi";
import { Edit, Trash2, Plus, Search } from "lucide-react";

const ProductsTable = ({
    products,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    openProductDetail,
    setShowForm,
    setSelectedProduct,
    handleDelete,
}) => {
    return (
        <div
            className="card border-0 shadow-sm rounded-4"
            style={{
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(8px)",
                border: "1px solid #f0f0f0",
            }}
        >
            <div className="card-body p-4">

                {/* HEADER */}
                <div
                    className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3"
                    style={{
                        paddingBottom: "10px",
                        borderBottom: "1px solid #e6e6e6",
                    }}
                >
                    <h4
                        className="m-0"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "26px",
                            fontWeight: 700,
                            color: "#2d2d2d",
                            letterSpacing: "0.5px",
                        }}
                    >
                        Products
                    </h4>

                    {/* ADD PRODUCT BUTTON (UNCHANGED) */}
                    <button
                        onClick={() => setShowForm(true)}
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
                            fontWeight: 500,
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "scale(1.04)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                        }
                    >
                        Add Product
                        <GiTShirt size={18} color="#1a2b3d" />
                    </button>
                </div>

                {/* SEARCH + SORT */}
                <div className="d-flex flex-wrap gap-3 mb-4">
                    {/* SEARCH BOX */}
                    <div
                        className="position-relative shadow-sm flex-grow-1"
                        style={{
                            maxWidth: "400px",
                            borderRadius: "14px",
                            overflow: "hidden",
                        }}
                    >
                        <Search
                            size={20}
                            className="position-absolute top-50 translate-middle-y text-muted"
                            style={{ left: "14px" }}
                        />
                        <input
                            className="form-control ps-5 py-2 border-0"
                            placeholder="Instant Search.."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                borderRadius: "14px",
                                height: "45px",
                                fontSize: "16px",
                                background: "#f7f7f7",
                            }}
                        />
                    </div>

                    {/* SORT */}
                    <select
                        className="form-select shadow-sm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            maxWidth: "200px",
                            borderRadius: "14px",
                            height: "45px",
                            background: "#f7f7f7",
                        }}
                    >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="price">Sort by Price</option>
                    </select>
                </div>

                {/* DESKTOP TABLE */}
                <div className="table-responsive d-none d-md-block">
                    <table className="table align-middle">

                        <thead>
                            <tr
                                style={{
                                    background: "#eef2ff",
                                    color: "#2d2d2d",
                                    fontWeight: 600,
                                    borderTopLeftRadius: "12px",
                                    borderTopRightRadius: "12px",
                                }}
                            >
                                <th>Thumbnail</th>
                                <th>Product Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Stock</th>
                                <th>Price</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.length > 0 ? (
                                products.map((product) => {
                                    const statusValue =
                                        product.status && product.status !== ""
                                            ? product.status
                                            : product.quantity > 0
                                                ? "In Stock"
                                                : "Out of Stock";

                                    return (
                                        <tr
                                            key={product._id}
                                            className="table-row-custom"
                                            style={{
                                                transition: "0.2s",
                                            }}
                                        >
                                            {/* THUMBNAIL */}
                                            <td>
                                                <div
                                                    style={{
                                                        width: "55px",
                                                        height: "55px",
                                                        borderRadius: "10px",
                                                        overflow: "hidden",
                                                        border: "1px solid #e5e5e5",
                                                        background: "#fafafa",
                                                    }}
                                                >
                                                    <img
                                                        src={product.image}
                                                        className="w-100 h-100"
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                </div>
                                            </td>

                                            {/* PRODUCT NAME */}
                                            <td
                                                onClick={() => openProductDetail(product)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="fw-semibold">{product.name}</div>
                                                <small className="text-muted">
                                                    SKU: {product._id?.slice(0, 6)}
                                                </small>
                                            </td>

                                            <td className="text-muted">{product.category}</td>

                                            {/* STATUS PILL */}
                                            <td>
                                                <span
                                                    style={{
                                                        background:
                                                            statusValue === "In Stock"
                                                                ? "#d1fae5"
                                                                : "#fee2e2",
                                                        color:
                                                            statusValue === "In Stock"
                                                                ? "#057a55"
                                                                : "#b91c1c",
                                                        padding: "6px 12px",
                                                        borderRadius: "20px",
                                                        fontSize: "13px",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {statusValue}
                                                </span>
                                            </td>

                                            {/* STOCK */}
                                            <td
                                                className={
                                                    product.quantity > 0
                                                        ? "text-success fw-bold"
                                                        : "text-danger fw-bold"
                                                }
                                            >
                                                {product.quantity}
                                            </td>

                                            {/* PRICE */}
                                            <td className="fw-bold">₹{product.price}</td>

                                            {/* ACTION BUTTONS */}
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary rounded-circle"
                                                        style={{ width: "36px", height: "36px" }}
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        <Edit size={16} />
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger rounded-circle"
                                                        style={{ width: "36px", height: "36px" }}
                                                        onClick={() =>
                                                            window.confirm("Delete this product?") &&
                                                            handleDelete(product._id)
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-5 text-muted">
                                        No Products Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE VIEW */}
                <div className="d-md-none">
                    {products.length > 0 ? (
                        products.map((product) => {
                            const statusValue =
                                product.status && product.status !== ""
                                    ? product.status
                                    : product.quantity > 0
                                        ? "In Stock"
                                        : "Out of Stock";

                            return (
                                <div
                                    key={product._id}
                                    className="p-3 mb-3 rounded-4 shadow-sm border"
                                    style={{ background: "#fff" }}
                                >
                                    <div className="d-flex gap-3">

                                        {/* IMAGE */}
                                        <div
                                            style={{
                                                width: "80px",
                                                height: "80px",
                                                borderRadius: "10px",
                                                overflow: "hidden",
                                                border: "1px solid #eee",
                                            }}
                                        >
                                            <img
                                                src={product.image}
                                                className="w-100 h-100"
                                                style={{ objectFit: "cover" }}
                                            />
                                        </div>

                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1">{product.name}</h6>
                                            <div className="text-muted small mb-1">
                                                Category: {product.category}
                                            </div>

                                            <span
                                                style={{
                                                    background:
                                                        statusValue === "In Stock"
                                                            ? "#d1fae5"
                                                            : "#fee2e2",
                                                    color:
                                                        statusValue === "In Stock"
                                                            ? "#057a55"
                                                            : "#b91c1c",
                                                    padding: "6px 12px",
                                                    borderRadius: "20px",
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {statusValue}
                                            </span>

                                            <div className="fw-bold mb-2 mt-2">₹{product.price}</div>

                                            <div className="d-flex gap-2 mt-2">
                                                <button
                                                    className="btn btn-sm btn-primary w-50"
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setShowForm(true);
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-danger w-50"
                                                    onClick={() =>
                                                        window.confirm("Delete this product?") &&
                                                        handleDelete(product._id)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-muted">No products found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsTable;

/* EXTRA CSS */
const style = document.createElement("style");
style.innerHTML = `
.table-row-custom:hover {
    background: #f7f9ff !important;
    transition: 0.2s;
}
`;
document.head.appendChild(style);
