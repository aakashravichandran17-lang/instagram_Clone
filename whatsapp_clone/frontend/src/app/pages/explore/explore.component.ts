import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { SearchService } from '../../services/search.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {
  searchQuery = '';
  searchResults: User[] = [];
  searching = false;
  posts: Post[] = [];
  loadingPosts = true;
  activeTab = 'posts';

  constructor(
    private postService: PostService,
    private searchService: SearchService,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPosts();

    // Subscribe to debounced search
    this.searchService.debouncedSearch.subscribe({
      next: (response) => {
        this.searchResults = response.data.users;
        this.searching = false;
      },
      error: () => {
        this.searching = false;
      }
    });
  }

  loadPosts(): void {
    this.loadingPosts = true;
    this.postService.getAllPosts().subscribe({
      next: (response) => {
        this.posts = response.data.posts;
        this.loadingPosts = false;
      },
      error: () => {
        this.loadingPosts = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim().length > 0) {
      this.searching = true;
      this.searchService.searchSubjectNext(this.searchQuery.trim());
    } else {
      this.searchResults = [];
    }
  }

  followUser(userId: string): void {
    const user = this.searchResults.find((u) => u.id === userId);
    this.userService.followUser(userId).subscribe({
      next: () => {
        if (user) {
          user.isFollowing = true;
          this.toastService.success(`Following ${user.fullName}`);
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to follow');
      }
    });
  }

  unfollowUser(userId: string): void {
    const user = this.searchResults.find((u) => u.id === userId);
    this.userService.unfollowUser(userId).subscribe({
      next: () => {
        if (user) {
          user.isFollowing = false;
          this.toastService.success(`Unfollowed ${user.fullName}`);
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to unfollow');
      }
    });
  }

  onPostDeleted(postId: string): void {
    this.posts = this.posts.filter((p) => p._id !== postId);
  }

  onPostUpdated(updatedPost: Post): void {
    const index = this.posts.findIndex((p) => p._id === updatedPost._id);
    if (index !== -1) {
      this.posts[index] = updatedPost;
    }
  }
}
