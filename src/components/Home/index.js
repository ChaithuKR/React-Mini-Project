import Loader from 'react-loader-spinner'
import {Component} from 'react'
import Cookies from 'js-cookie'
import Header from '../Header'
import Stories from '../Stories'
import Posts from '../Posts'
import PostItem from '../PostItem'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Home extends Component {
  state = {
    searchInput: '',
    searchResults: [],
    apiStatus: apiStatusConstants.initial,
  }

  getSearchData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {searchInput} = this.state

    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/insta-share/posts?search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok === true) {
      const data = await response.json()
      const updatedData = data.posts.map(eachPost => ({
        comments: eachPost.comments.map(eachComment => ({
          userName: eachComment.user_name,
          userId: eachComment.user_id,
          comment: eachComment.comment,
        })),
        createdAt: eachPost.created_at,
        likesCount: eachPost.likes_count,
        postDetails: {
          imageUrl: eachPost.post_details.image_url,
          caption: eachPost.post_details.caption,
        },
        postId: eachPost.post_id,
        profilePic: eachPost.profile_pic,
        userId: eachPost.user_id,
        userName: eachPost.user_name,
      }))
      console.log(updatedData)
      this.setState({
        apiStatus: apiStatusConstants.success,
        searchResults: updatedData,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  clickSearchButton = input => {
    this.setState({searchInput: input}, this.getSearchData)
  }

  renderSuccessView = () => {
    const {searchResults} = this.state
    return (
      <div className="posts-main-container">
        {searchResults.length === 0 ? (
          <div className="no-posts-container">
            <img
              src="https://res.cloudinary.com/dzvmpn4nr/image/upload/v1679656768/Group_uiehcz.svg"
              alt="search not found"
              className="not-found-image"
            />
            <h1 className="search-not-found-text">Search Not Found</h1>
            <p className="search-not-found-para">
              Try different keyword or search again
            </p>
          </div>
        ) : (
          <div className="search-container">
            <h1 className="search-heading">Search Results</h1>
            <ul className="search-posts-list">
              {searchResults.map(each => (
                <PostItem details={each} key={each.postId} />
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  renderViews = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderSuccessView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  renderFailureView = () => (
    <div className="profile-error-view-container">
      <img
        src="https://res.cloudinary.com/dzvmpn4nr/image/upload/v1679656650/Group_7522_mbm51a.svg"
        alt="failure view"
        className="profile-failure-img"
      />
      <p className="profile-failure-text">
        Something went wrong. Please try again
      </p>
      <button
        type="button"
        data-testid="button"
        className="profile-failure-button"
        onClick={this.getSearchData}
      >
        Try again
      </button>
    </div>
  )

  renderLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="TailSpin" color="#4094EF" height={50} width={50} />
    </div>
  )

  render() {
    const {searchInput} = this.state
    return (
      <>
        <Header searchFunction={this.clickSearchButton} />
        {searchInput === '' ? (
          <>
            <Stories />
            <Posts />
          </>
        ) : (
          this.renderViews()
        )}
      </>
    )
  }
}
export default Home
