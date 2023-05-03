import React from 'react'
import { Pagination } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function Paginate({ page, pages, keyword = '', isAdmin = false }) {
  if (keyword) {
    keyword = keyword.split('?keyword=')[1].split('&')[0]
  }

  return (
    pages > 1 && (
      <Pagination>
        {[...Array(pages).keys()].map((x) => (
          <div key={x + 1}>
            <Link
              to={!isAdmin ?
                `/?keyword=${keyword}&page=${x + 1}`
                : `/admin/productlist/?keyword=${keyword}&page=${x + 1}`
            }
              className={`page-link ${x + 1 === page ? 'active' : ''}`}
            >
              {x + 1}
            </Link>
          </div>
        ))}
      </Pagination>
    )
  )
}

export default Paginate
