import { Component, inject, OnInit } from '@angular/core';
import { GithubService } from '../../services/github';

@Component({
  selector: 'app-quien-soy',
  imports: [],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoyComponent implements OnInit {
  // Lo dejamos público para usarlo directo en el HTML
  public githubService = inject(GithubService);

  ngOnInit(): void {
    // Reemplazá por tu usuario real
    this.githubService.loadProfile('michelmassaad'); 
  }

}
