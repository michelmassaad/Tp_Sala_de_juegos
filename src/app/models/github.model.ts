// Este archivo define la interfaz `GithubUser`, que representa la estructura de los datos de un usuario de GitHub.
export interface GithubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  location:string;
  public_repos: number;
  html_url: string;
}