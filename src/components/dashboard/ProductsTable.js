import React from "react";
import { Edit, Trash2, Plus, Search } from "lucide-react";

const ProductsTable = ({
    products,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    openProductDetail,
    setShowForm,
    handleDelete
}) => {
    return (
        <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
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


                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
    

        {/* ICON INSIDE PRODUCTS ITEM */}
        <button
        
            onClick={() => setShowForm(true)}
            
            style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "1.5px solid #dadada",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "0.2s",
                padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
            <Plus size={16} color="#3A57E8" strokeWidth={2.4} />
        </button>

</div>

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
                            }}
                        />
                    </div>

                    {/* SORT DROPDOWN */}
                    <select
                        className="form-select shadow-sm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            maxWidth: "200px",
                            borderRadius: "14px",
                            height: "45px",
                        }}
                    >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="price">Sort by Price</option>
                    </select>
                </div>

                {/* ---------------------------- */}
                {/*     DESKTOP TABLE VIEW      */}
                {/* ---------------------------- */}
                <div className="table-responsive d-none d-md-block">
                    <table className="table table-hover align-middle">

                        <thead
                            style={{
                                background: "#3c3f58",
                                color: "white",
                                fontSize: "15px",
                            }}
                        >
                            <tr>
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
                                        <tr key={product._id}>

                                            <td>
                                                <div
                                                    className="rounded"
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        overflow: "hidden",
                                                        border: "1px solid #eee",
                                                    }}
                                                >
                                                    <img
                                                        src={product.image}
                                                        alt="product"
                                                        className="w-100 h-100"
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                </div>
                                            </td>

                                            <td onClick={() => openProductDetail(product)}>
                                                <div className="fw-semibold">{product.name}</div>
                                                <small className="text-muted">
                                                    SKU: {product._id?.slice(0, 6)}
                                                </small>
                                            </td>

                                            <td className="text-muted">{product.category}</td>

                                            <td>
                                                <span
                                                    className={`badge px-3 py-2 rounded-pill ${
                                                        statusValue === "In Stock"
                                                            ? "bg-success"
                                                            : "bg-danger"
                                                    }`}
                                                >
                                                    {statusValue}
                                                </span>
                                            </td>

                                            <td
                                                className={
                                                    product.quantity > 0
                                                        ? "text-success fw-bold"
                                                        : "text-danger fw-bold"
                                                }
                                            >
                                                {product.quantity}
                                            </td>

                                            <td className="fw-bold">₹{product.price}</td>

                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary rounded-circle"
                                                        style={{ width: "36px", height: "36px" }}
                                                        onClick={() => openProductDetail(product)}
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

                {/* ---------------------------- */}
                {/*     MOBILE CARD VIEW        */}
                {/* ---------------------------- */}
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

                                        {/* TEXT DETAILS */}
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1">{product.name}</h6>
                                            <div className="text-muted small mb-1">
                                                Category: {product.category}
                                            </div>

                                            <span
                                                className={`badge px-3 py-2 rounded-pill mb-2 ${
                                                    statusValue === "In Stock"
                                                        ? "bg-success"
                                                        : "bg-danger"
                                                }`}
                                            >
                                                {statusValue}
                                            </span>

                                            <div className="fw-bold mb-2">₹{product.price}</div>

                                            {/* MOBILE ACTION BUTTONS */}
                                            <div className="d-flex gap-2 mt-2">
                                                <button
                                                    className="btn btn-sm btn-primary w-50"
                                                    onClick={() => openProductDetail(product)}
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
