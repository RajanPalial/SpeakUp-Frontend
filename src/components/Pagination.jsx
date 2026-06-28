import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import "./Pagination.scss"; // import the dark theme styles

const Pagination = ({ page, setPage, perPage, totalPage }) => {
  const [pageCount, setPageCount] = useState(0);

  const handlePageClick = (event) => {
    const countNumber = event.selected + 1;
    setPage({ ...page, currentPage: countNumber });
  };

  useEffect(() => {
    setPageCount(Math.ceil(totalPage / perPage));
  }, [perPage, totalPage]); // include totalPage so count updates correctly

  return (
    <div className="dark-pagination-wrapper d-flex justify-content-end mt-3">
      <ReactPaginate
        breakLabel="…"
        previousLabel={
          <span className="nav-label">
            <span className="arrow">‹</span> Prev
          </span>
        }
        nextLabel={
          <span className="nav-label">
            Next <span className="arrow">›</span>
          </span>
        }
        pageCount={pageCount}
        // keep the active page in sync with parent state
        forcePage={page?.currentPage ? page.currentPage - 1 : 0}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        renderOnZeroPageCount={null}
        containerClassName="dark-pagination"
        pageClassName="dp-item"
        pageLinkClassName="dp-link"
        previousClassName="dp-item dp-nav"
        previousLinkClassName="dp-link"
        nextClassName="dp-item dp-nav"
        nextLinkClassName="dp-link"
        breakClassName="dp-item dp-break"
        breakLinkClassName="dp-link"
        activeClassName="active"
        disabledClassName="disabled"
      />
    </div>
  );
};

export default Pagination;