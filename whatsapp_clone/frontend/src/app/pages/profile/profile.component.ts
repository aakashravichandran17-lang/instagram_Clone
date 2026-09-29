import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  posts: Post[] = [];
  loading = true;
  postsLoading = true;
  isOwnProfile = false;
  activeTab = 'posts';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private postService: PostService,
    private chatService: ChatService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const username = params['username'];
      if (username) {
        this.loadProfile(username);
      }
    });
  }

  loadProfile(username: string): void {
    this.loading = true;
    this.postsLoading = true;

    this.userService.getUserByUsername(username).subscribe({
      next: (response) => {
        this.user = response.data.user;
        this.isOwnProfile =
          this.authService.getCurrentUser()?.username === username;
        this.loading = false;
        this.loadUserPosts();
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'User not found');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadUserPosts(): void {
    if (!this.user) return;

    this.postService.getAllPosts().subscribe({
      next: (response) => {
        this.posts = response.data.posts.filter(
          (p) => p.author.id === this.user!.id
        );
        this.postsLoading = false;
      },
      error: () => {
        this.postsLoading = false;
      }
    });
  }

  followUser(): void {
    if (!this.user) return;
    this.userService.followUser(this.user.id).subscribe({
      next: () => {
        this.user!.isFollowing = true;
        this.user!.followersCount++;
        this.toastService.success(`Following ${this.user!.fullName}`);
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to follow');
      }
    });
  }

  unfollowUser(): void {
    if (!this.user) return;
    this.userService.unfollowUser(this.user.id).subscribe({
      next: () => {
        this.user!.isFollowing = false;
        this.user!.followersCount--;
        this.toastService.success(`Unfollowed ${this.user!.fullName}`);
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to unfollow');
      }
    });
  }

  sendMessage(): void {
    if (!this.user) return;
    this.chatService.createConversation(this.user.id).subscribe({
      next: (response) => {
        this.router.navigate(['/messages', response.data.conversation.id]);
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to start conversation');
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
