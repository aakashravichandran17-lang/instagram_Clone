import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  posts: Post[] = [];
  loading = true;

  constructor(
    private postService: PostService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadFeed();
  }

  loadFeed(): void {
    this.loading = true;
    this.postService.getFeed().subscribe({
      next: (response) => {
        this.posts = response.data.posts;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'Failed to load feed');
      }
    });
  }

  onPostCreated(post: Post): void {
    this.posts.unshift(post);
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
