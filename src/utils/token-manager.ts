import moment from 'moment-timezone';

/**
 * Interface for token information
 */
interface TokenInfo {
  token: string;
  expiresAt: string; // ISO date string
}

/**
 * Manages authentication tokens for multiple TINs
 */
export class TokenManager {
  private tokens: Map<string, TokenInfo> = new Map();
  private defaultToken: TokenInfo | null = null;
  
  /**
   * Sets a token for a specific TIN
   * @param tin The TIN to set the token for
   * @param token The token to set
   * @param expiresIn The token expiry in seconds
   */
  setTokenForTIN(tin: string, token: string, expiresIn: number): void {
    const expiresAt = moment().add(expiresIn, 'seconds').toISOString();
    this.tokens.set(tin, { token, expiresAt });
  }
  
  /**
   * Sets the default token (for system authentication)
   * @param token The token to set
   * @param expiresIn The token expiry in seconds
   */
  setDefaultToken(token: string, expiresIn: number): void {
    const expiresAt = moment().add(expiresIn, 'seconds').toISOString();
    this.defaultToken = { token, expiresAt };
  }
  
  /**
   * Gets a token for a specific TIN if it exists and is valid
   * @param tin The TIN to get the token for
   * @returns The token if it exists and is valid, null otherwise
   */
  getTokenForTIN(tin: string): string | null {
    const tokenInfo = this.tokens.get(tin);
    
    if (tokenInfo && moment(tokenInfo.expiresAt).tz('Asia/Kuala_Lumpur').isAfter(moment().utc())) {
      return tokenInfo.token;
    }
    
    return null;
  }
  
  /**
   * Gets the default token if it exists and is valid
   * @returns The default token if it exists and is valid, null otherwise
   */
  getDefaultToken(): string | null {
    if (this.defaultToken && moment(this.defaultToken.expiresAt).tz('Asia/Kuala_Lumpur').isAfter(moment().utc())) {
      return this.defaultToken.token;
    }
    
    return null;
  }
  
  /**
   * Checks if a token for a specific TIN is valid
   * @param tin The TIN to check
   * @returns Whether the token is valid
   */
  isTokenValid(tin: string): boolean {
    return this.getTokenForTIN(tin) !== null;
  }
  
  /**
   * Checks if the default token is valid
   * @returns Whether the default token is valid
   */
  isDefaultTokenValid(): boolean {
    return this.getDefaultToken() !== null;
  }
  
  /**
   * Gets all TINs with stored tokens
   * @returns An array of TINs
   */
  getAllTINs(): string[] {
    return Array.from(this.tokens.keys());
  }
  
  /**
   * Clears all tokens
   */
  clearAllTokens(): void {
    this.tokens.clear();
    this.defaultToken = null;
  }
} 