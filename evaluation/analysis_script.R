install.packages("rstatix")
install.packages("ggpubr")


# Load required libraries
library(tidyverse)
library(ggplot2)
library(rstatix)
library(ggpubr)

# Read the data
data <- read.csv("./results/results.csv", header=TRUE, quote="\"", stringsAsFactors=FALSE)

# Clean the data
data <- data %>%
  filter(!is.na(service) & service != "") %>%  # Remove empty rows
  mutate(
    bleu_score = as.numeric(bleu_score),
    meteor_score = as.numeric(meteor_score),
    time_taken = as.numeric(time_taken)
  )

# Shapiro-Wilk test for each metric
shapiro_bleu <- shapiro.test(data$bleu_score)
shapiro_meteor <- shapiro.test(data$meteor_score)
shapiro_time <- shapiro.test(data$time_taken)
shapiro_bleu
shapiro_meteor
shapiro_time

# Histogram with density curve
hist(data$bleu_score, probability = TRUE, col = "lightblue", main = "Histogram of BLEU Score")
lines(density(data$bleu_score), col = "red", lwd = 2)

hist(data$meteor_score, probability = TRUE, col = "lightgreen", main = "Histogram of METEOR Score")
lines(density(data$meteor_score), col = "red", lwd = 2)

hist(data$time_taken, probability = TRUE, col = "lightcoral", main = "Histogram of Time Taken")
lines(density(data$time_taken), col = "red", lwd = 2)



# Calculate summary statistics
summary_stats <- data %>%
  group_by(service) %>%
  summarise(
    mean_bleu = mean(bleu_score, na.rm=TRUE),
    sd_bleu = sd(bleu_score, na.rm=TRUE),
    mean_meteor = mean(meteor_score, na.rm=TRUE),
    sd_meteor = sd(meteor_score, na.rm=TRUE),
    mean_time = mean(time_taken, na.rm=TRUE),
    sd_time = sd(time_taken, na.rm=TRUE)
  )
summary_stats


# Perform Kruskal-Wallis tests
kw_bleu <- kruskal.test(bleu_score ~ service, data = data)
kw_meteor <- kruskal.test(meteor_score ~ service, data = data)
kw_time <- kruskal.test(time_taken ~ service, data = data)
kw_bleu;  kw_meteor;  kw_time;


# Perform pairwise Wilcoxon tests with p-value adjustment
pw_bleu <- pairwise.wilcox.test(data$bleu_score, data$service, p.adjust.method = "bonferroni")
pw_meteor <- pairwise.wilcox.test(data$meteor_score, data$service, p.adjust.method = "bonferroni")
pw_time <- pairwise.wilcox.test(data$time_taken, data$service, p.adjust.method = "bonferroni")
pw_bleu;  pw_meteor;  pw_time;

# Create visualizations
# Box plots for BLEU scores
bleu_plot <- ggplot(data, aes(x = service, y = bleu_score, fill = service)) +
  geom_boxplot() +
  theme_minimal() +
  labs(title = "BLEU-Werte nach Dienst",
       x = "Dienst",
       y = "BLEU-Wert") +
  theme(legend.position = "none")

# Box plots for METEOR scores
meteor_plot <- ggplot(data, aes(x = service, y = meteor_score, fill = service)) +
  geom_boxplot() +
  theme_minimal() +
  labs(title = "METEOR-Werte nach Dienst",
       x = "Dienst",
       y = "METEOR-Wert") +
  theme(legend.position = "none")

# Box plots for translation times
time_plot <- ggplot(data, aes(x = service, y = time_taken, fill = service)) +
  geom_boxplot() +
  theme_minimal() +
  labs(title = "Übersetzungszeiten nach Dienst",
       x = "Dienst",
       y = "Zeit (Sekunden)") +
  theme(legend.position = "none")

# Print results
print("Summary Statistics:")
print(summary_stats)

print("\nKruskal-Wallis Test Results:")
print("BLEU Scores:")
print(kw_bleu)
print("METEOR Scores:")
print(kw_meteor)
print("Translation Times:")
print(kw_time)

print("\nPairwise Comparisons:")
print("BLEU Scores:")
print(pw_bleu)
print("METEOR Scores:")
print(pw_meteor)
print("Translation Times:")
print(pw_time)

# Save plots
ggsave("bleu_comparison.png", bleu_plot)
ggsave("meteor_comparison.png", meteor_plot)
ggsave("time_comparison.png", time_plot)

# Create a combined visualization
combined_plot <- ggarrange(bleu_plot, meteor_plot, time_plot,
                           ncol = 3, nrow = 1)

ggsave("combined_comparison.png", combined_plot, width = 15, height = 5)



# Function to calculate and print the median values for each metric by service
print_medians <- function(df) {
  # Median for BLEU score by service
  bleu_medians <- df %>%
    group_by(service) %>%
    summarize(median_bleu = median(bleu_score, na.rm = TRUE))
  
  cat("Median BLEU scores by service:\n")
  print(bleu_medians)
  
  # Median for METEOR score by service
  meteor_medians <- df %>%
    group_by(service) %>%
    summarize(median_meteor = median(meteor_score, na.rm = TRUE))
  
  cat("\nMedian METEOR scores by service:\n")
  print(meteor_medians)
  
  # Median for translation times by service
  time_medians <- df %>%
    group_by(service) %>%
    summarize(median_time = median(time_taken, na.rm = TRUE))
  
  cat("\nMedian translation times by service (in seconds):\n")
  print(time_medians)
}

# Call the function to print the medians
print_medians(data)